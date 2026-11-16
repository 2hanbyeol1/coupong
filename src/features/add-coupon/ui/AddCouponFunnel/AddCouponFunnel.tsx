"use client";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { FormProvider, SubmitErrorHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import {
  CouponImageUploadError,
  CouponUploadStatus,
} from "@/entities/coupon/api/api";
import { addCouponsOption } from "@/entities/coupon/api/query";
import { useOrganizationStore } from "@/entities/organization/model/store";
import { ROUTES } from "@/shared/config/routes";
import useFunnel from "@/shared/lib/hook/useFunnel";
import useModal from "@/shared/lib/hook/useModal";
import useToast from "@/shared/lib/hook/useToast";
import { Funnel, FunnelStep } from "@/shared/ui";
import { FullView } from "@/shared/ui/FullView";

import { AddCouponFormValues, addCouponSchema } from "../../lib/schema";
import { getFirstCouponInfoError } from "../../lib/util";

import { CouponImageUploader } from "./Steps/CouponImageUploader";
import {
  CouponInfoInputs,
  CouponInputMode,
  DEFAULT_COUPON_INPUT_MODE,
  DEFAULT_SHARED_FIELDS,
} from "./Steps/CouponInfoInputs";
import RegisterConfirmSheet, { RegisterPhase } from "./RegisterConfirmSheet";

const addCouponStepNames = {
  IMAGE_UPLOAD: "image-upload",
  COUPON_INFO: "coupon-info",
} as const;

type AddCouponStep =
  (typeof addCouponStepNames)[keyof typeof addCouponStepNames];

/**
 * 단계를 history에 쌓아, 헤더 ←·시스템 뒤로가기가 한 단계씩 돌아가게 함
 * [등록 화면] → [사진 선택 (사진을 고르면 쌓음)] → [정보 입력]
 * 사진 선택에서 더 뒤로 가면 나가기 확인을 띄움
 */
const STEP_STATE_KEY = "couponAddStep";
const STEP_SEARCH_PARAM = "step";

const getStepFromState = (state: unknown): AddCouponStep | undefined => {
  const step = (state as Record<string, unknown> | null)?.[STEP_STATE_KEY];
  return step === addCouponStepNames.IMAGE_UPLOAD ||
    step === addCouponStepNames.COUPON_INFO
    ? step
    : undefined;
};

const pushStepState = (step: AddCouponStep) => {
  const url =
    step === addCouponStepNames.COUPON_INFO
      ? `?${STEP_SEARCH_PARAM}=${step}`
      : window.location.pathname;
  window.history.pushState({ [STEP_STATE_KEY]: step }, "", url);
};

/** 단계 기록 몇 개를 걷어내고, 돌아간 뒤에 resolve */
const goBackInHistory = (count: number) =>
  new Promise<void>((resolve) => {
    if (count <= 0) {
      resolve();
      return;
    }
    window.addEventListener("popstate", () => resolve(), { once: true });
    window.history.go(-count);
  });

interface AddCouponFunnelProps {
  /** 등록할 그룹을 고르는 영역 (첫 단계와 등록 확인에 표시) */
  organizationField?: ReactNode;
}

function AddCouponFunnel({ organizationField }: AddCouponFunnelProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { showModal, hideModal } = useModal();
  const { step, setStep } = useFunnel(addCouponStepNames.IMAGE_UPLOAD);
  const { selectedOrganizationId: selectedOrgId } = useOrganizationStore();

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [currentCouponIndex, setCurrentCouponIndex] = useState(0);
  // 사진 삭제 확인 모달에서 '이번 등록에서는 다시 묻지 않기'를 고르면 false
  const [confirmBeforeImageRemove, setConfirmBeforeImageRemove] =
    useState(true);

  // 정보 입력 방식 (사진 선택 단계에 다녀와도 유지)
  const [couponInputMode, setCouponInputMode] = useState<CouponInputMode>(
    DEFAULT_COUPON_INPUT_MODE,
  );
  const [sharedFields, setSharedFields] = useState(DEFAULT_SHARED_FIELDS);

  // 등록 확인 시트
  const [isRegisterSheetOpen, setIsRegisterSheetOpen] = useState(false);
  const [registerPhase, setRegisterPhase] = useState<RegisterPhase>("confirm");
  const [registerData, setRegisterData] = useState<AddCouponFormValues | null>(
    null,
  );
  const [uploadStatuses, setUploadStatuses] = useState<CouponUploadStatus[]>(
    [],
  );
  const [registerError, setRegisterError] = useState<string>();

  const methods = useForm<AddCouponFormValues>({
    mode: "onChange",
    resolver: zodResolver(addCouponSchema),
    defaultValues: { coupons: [] },
  });

  const hasImages = imagePreviews.length > 0;
  const hasImagesRef = useRef(false);
  const imagePreviewsRef = useRef<string[]>([]);
  useEffect(() => {
    hasImagesRef.current = hasImages;
    imagePreviewsRef.current = imagePreviews;
  }, [hasImages, imagePreviews]);

  // 등록 중이거나 페이지를 떠나는 중에는 뒤로가기를 단계 이동으로 처리하지 않음
  const isSubmittingRef = useRef(false);
  const isLeavingRef = useRef(false);
  const leaveFallbackTimerRef =
    useRef<ReturnType<typeof setTimeout>>(undefined);

  /** 사진 선택 단계 기록 위에서 두 칸 뒤 = 등록 화면에 들어오기 전 화면 */
  const leavePage = useCallback(() => {
    isLeavingRef.current = true;
    const addCouponPath = window.location.pathname;
    window.history.go(-2);
    // 등록 화면으로 바로 들어와 돌아갈 화면이 없어 그대로 남아 있으면 홈으로
    leaveFallbackTimerRef.current = setTimeout(() => {
      if (window.location.pathname === addCouponPath) {
        router.replace(ROUTES.HOME);
      }
    }, 500);
  }, [router]);

  const showLeaveConfirm = useCallback(() => {
    showModal({
      title: "쿠폰 등록을 그만둘까요?",
      content: (
        <p className="break-keep">
          선택한 사진 {imagePreviewsRef.current.length}장과 입력한 정보가
          사라져요.
        </p>
      ),
      cancelButtonText: "나가기",
      onCancel: () => {
        hideModal();
        leavePage();
      },
      confirmButtonText: "계속 작성",
      onConfirm: () => hideModal(),
    });
  }, [showModal, hideModal, leavePage]);

  useEffect(() => {
    // 새로고침하면 선택한 사진이 사라지므로 단계 표시를 지우고 첫 단계부터 시작
    if (new URLSearchParams(window.location.search).has(STEP_SEARCH_PARAM)) {
      window.history.replaceState(null, "", window.location.pathname);
    }

    const handlePopState = (event: PopStateEvent) => {
      if (isLeavingRef.current) return;
      const stepInState = getStepFromState(event.state);

      // 등록 중에는 뒤로가기를 막고 정보 입력 단계에 머묾
      if (isSubmittingRef.current) {
        pushStepState(addCouponStepNames.COUPON_INFO);
        return;
      }

      if (stepInState === addCouponStepNames.COUPON_INFO) {
        setStep(
          hasImagesRef.current
            ? addCouponStepNames.COUPON_INFO
            : addCouponStepNames.IMAGE_UPLOAD,
        );
        return;
      }
      if (stepInState === addCouponStepNames.IMAGE_UPLOAD) {
        setStep(addCouponStepNames.IMAGE_UPLOAD);
        return;
      }

      // 사진 선택 단계에서 더 뒤로 감 = 등록 화면을 나가려 함
      setStep(addCouponStepNames.IMAGE_UPLOAD);
      if (!hasImagesRef.current) {
        // 작성한 게 없으면 확인 없이 나감
        isLeavingRef.current = true;
        window.history.back();
        return;
      }
      pushStepState(addCouponStepNames.IMAGE_UPLOAD);
      showLeaveConfirm();
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [setStep, showLeaveConfirm]);

  // 사진을 고르면 사진 선택 단계 기록을 쌓아, 뒤로가기를 나가기 확인으로 받음
  useEffect(() => {
    if (!hasImages || getStepFromState(window.history.state)) return;
    pushStepState(addCouponStepNames.IMAGE_UPLOAD);
  }, [hasImages]);

  // 작성 중에 새로고침하거나 탭을 닫으면 브라우저 확인 창
  useEffect(() => {
    if (!hasImages) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isLeavingRef.current) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasImages]);

  // 페이지를 떠날 때 남은 미리보기 URL 해제
  useEffect(() => {
    return () => {
      imagePreviewsRef.current.forEach((url) => URL.revokeObjectURL(url));
      clearTimeout(leaveFallbackTimerRef.current);
    };
  }, []);

  const goToCouponInfoStep = () => {
    pushStepState(addCouponStepNames.COUPON_INFO);
    setStep(addCouponStepNames.COUPON_INFO);
  };

  const goToImageUploadStep = () => {
    // 정보 입력 단계는 history에 쌓여 있으므로 뒤로가기와 같게 동작 (popstate에서 단계 변경)
    if (
      getStepFromState(window.history.state) === addCouponStepNames.COUPON_INFO
    ) {
      window.history.back();
      return;
    }
    setStep(addCouponStepNames.IMAGE_UPLOAD);
  };

  // 미리보기 URL은 사진마다 한 번만 만들어 유지 (목록 key로 쓰여, 바뀌면 사진이 다시 그려지며 깜빡임)
  const handleImagesAdd = (files: File[]) => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...urls]);
    setCurrentCouponIndex(0);
  };

  const handleImageRemove = (index: number) => {
    const url = imagePreviews[index];
    if (url) URL.revokeObjectURL(url);
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setCurrentCouponIndex(0);
  };

  const registeredCountRef = useRef(0);

  const { mutate: addCoupons } = useMutation({
    ...addCouponsOption(queryClient, {
      onSuccess: async () => {
        isSubmittingRef.current = false;
        const count = registeredCountRef.current;
        addToast({
          message:
            count > 1 ? `${count}개 쿠폰을 등록했어요` : "쿠폰을 등록했어요",
        });
        setIsRegisterSheetOpen(false);

        // 쌓아 둔 단계 기록을 걷어낸 뒤 등록 화면 자리를 홈으로 교체해,
        // 홈에서 뒤로가기를 누르면 빈 등록 화면이 아니라 들어오기 전 화면으로 감
        isLeavingRef.current = true;
        const stepInState = getStepFromState(window.history.state);
        const depth =
          stepInState === addCouponStepNames.COUPON_INFO
            ? 2
            : stepInState === addCouponStepNames.IMAGE_UPLOAD
              ? 1
              : 0;
        await goBackInHistory(depth);
        router.replace(ROUTES.HOME);
      },
      onError: (error) => {
        isSubmittingRef.current = false;
        setRegisterError(
          error instanceof CouponImageUploadError
            ? error.message
            : "쿠폰을 등록하지 못했어요",
        );
        setRegisterPhase("error");
      },
    }),
  });

  // 폼 검증을 통과하면 등록 확인 시트를 띄움
  const handleSubmit = (data: AddCouponFormValues) => {
    setRegisterData(data);
    setUploadStatuses(data.coupons.map(() => "pending"));
    setRegisterError(undefined);
    setRegisterPhase("confirm");
    setIsRegisterSheetOpen(true);
  };

  const handleRegister = () => {
    if (!registerData) return;
    if (!selectedOrgId) {
      addToast({ message: "등록할 그룹을 선택해 주세요" });
      return;
    }

    isSubmittingRef.current = true;
    registeredCountRef.current = registerData.coupons.length;
    setRegisterPhase("submitting");
    setUploadStatuses(registerData.coupons.map(() => "pending"));
    addCoupons({
      formValues: registerData,
      orgId: selectedOrgId,
      onUploadStatusChange: (index, status) =>
        setUploadStatuses((prev) =>
          prev.map((prevStatus, i) => (i === index ? status : prevStatus)),
        ),
    });
  };

  const handleInvalid: SubmitErrorHandler<AddCouponFormValues> = (errors) => {
    if (errors.imageFile?.message) {
      addToast({ message: errors.imageFile.message as string });
      return;
    }

    const couponErrors = errors.coupons;
    if (!Array.isArray(couponErrors)) return;

    for (let index = 0; index < couponErrors.length; index++) {
      const firstError = getFirstCouponInfoError(couponErrors[index]);
      if (firstError) {
        addToast({ message: firstError.message });
        setCurrentCouponIndex(index);
        return;
      }
    }
  };

  const submitLabel =
    imagePreviews.length > 1 ? `${imagePreviews.length}개 쿠폰 등록` : "등록";

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit, handleInvalid)}>
        <Funnel currentStep={step}>
          {/* 1) 기프티콘 이미지 업로드 (여러 장) */}
          <FunnelStep name={addCouponStepNames.IMAGE_UPLOAD}>
            <FullView className="relative" withHeader={true}>
              <CouponImageUploader
                onNext={goToCouponInfoStep}
                imagePreviews={imagePreviews}
                onImagesAdd={handleImagesAdd}
                onImageRemove={handleImageRemove}
                confirmBeforeRemove={confirmBeforeImageRemove}
                onDisableRemoveConfirm={() =>
                  setConfirmBeforeImageRemove(false)
                }
                organizationField={organizationField}
              />
            </FullView>
          </FunnelStep>

          {/* 2) 이미지별 쿠폰 정보 입력 */}
          <FunnelStep name={addCouponStepNames.COUPON_INFO}>
            {imagePreviews.length > 0 && (
              <FullView className="relative" withHeader={true}>
                <div className="flex h-full w-full flex-col overflow-hidden p-4">
                  <CouponInfoInputs
                    imagePreviews={imagePreviews}
                    currentIndex={currentCouponIndex}
                    onCurrentIndexChange={setCurrentCouponIndex}
                    isSubmitting={registerPhase === "submitting"}
                    submitLabel={submitLabel}
                    onBackToImages={goToImageUploadStep}
                    inputMode={couponInputMode}
                    onInputModeChange={setCouponInputMode}
                    sharedFields={sharedFields}
                    onSharedFieldsChange={setSharedFields}
                  />
                </div>
              </FullView>
            )}
          </FunnelStep>
        </Funnel>
      </form>

      <RegisterConfirmSheet
        open={isRegisterSheetOpen}
        phase={registerPhase}
        coupons={registerData?.coupons ?? []}
        imagePreviews={imagePreviews}
        uploadStatuses={uploadStatuses}
        errorMessage={registerError}
        organizationField={organizationField}
        onClose={() => setIsRegisterSheetOpen(false)}
        onSubmit={handleRegister}
      />
    </FormProvider>
  );
}

export default AddCouponFunnel;
