"use client";
import { ReactNode, useEffect, useRef, useState } from "react";
import { FormProvider, SubmitErrorHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { addCouponsOption } from "@/entities/coupon/api/query";
import { useOrganizationStore } from "@/entities/organization/model/store";
import { ROUTES } from "@/shared/config/routes";
import useFunnel from "@/shared/lib/hook/useFunnel";
import useModal from "@/shared/lib/hook/useModal";
import useToast from "@/shared/lib/hook/useToast";
import { getYYYYMMDD } from "@/shared/lib/util/date";
import { Funnel, FunnelStep } from "@/shared/ui";
import { FullView } from "@/shared/ui/FullView";

import { AddCouponFormValues, addCouponSchema } from "../../lib/schema";
import { getFirstCouponInfoError } from "../../lib/util";

import { CouponImageUploader } from "./Steps/CouponImageUploader";
import { CouponInfoInputs } from "./Steps/CouponInfoInputs";

const addCouponStepNames = {
  IMAGE_UPLOAD: "image-upload",
  COUPON_INFO: "coupon-info",
};

// 정보 입력 단계를 history에 쌓아, 뒤로가기 시 페이지를 나가지 않고 사진 선택 단계로 돌아가게 함
const STEP_SEARCH_PARAM = "step";

const isCouponInfoStepUrl = () =>
  new URLSearchParams(window.location.search).get(STEP_SEARCH_PARAM) ===
  addCouponStepNames.COUPON_INFO;

interface AddCouponFunnelProps {
  /** 등록할 그룹을 고르는 영역 (첫 단계에 표시) */
  organizationField?: ReactNode;
}

function AddCouponFunnel({ organizationField }: AddCouponFunnelProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { showModal, hideModal, updateModal } = useModal();
  const { step, setStep } = useFunnel(addCouponStepNames.IMAGE_UPLOAD);
  const { selectedOrganizationId: selectedOrgId } = useOrganizationStore();

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [currentCouponIndex, setCurrentCouponIndex] = useState(0);
  // 사진 삭제 확인 모달에서 '이번 등록에서는 다시 묻지 않기'를 고르면 false
  const [confirmBeforeImageRemove, setConfirmBeforeImageRemove] =
    useState(true);

  const methods = useForm<AddCouponFormValues>({
    mode: "onChange",
    resolver: zodResolver(addCouponSchema),
    defaultValues: { coupons: [] },
  });

  const hasImagesRef = useRef(false);
  const imagePreviewsRef = useRef<string[]>([]);
  useEffect(() => {
    hasImagesRef.current = imagePreviews.length > 0;
    imagePreviewsRef.current = imagePreviews;
  }, [imagePreviews]);

  useEffect(() => {
    // 새로고침하면 선택한 사진이 사라지므로 단계 표시를 지우고 첫 단계부터 시작
    if (isCouponInfoStepUrl()) {
      window.history.replaceState(null, "", window.location.pathname);
    }

    const handlePopState = () => {
      setStep(
        isCouponInfoStepUrl() && hasImagesRef.current
          ? addCouponStepNames.COUPON_INFO
          : addCouponStepNames.IMAGE_UPLOAD,
      );
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [setStep]);

  const goToCouponInfoStep = () => {
    window.history.pushState(
      null,
      "",
      `?${STEP_SEARCH_PARAM}=${addCouponStepNames.COUPON_INFO}`,
    );
    setStep(addCouponStepNames.COUPON_INFO);
  };

  const goToImageUploadStep = () => {
    // 정보 입력 단계는 history에 쌓여 있으므로 뒤로가기와 같게 동작 (popstate에서 단계 변경)
    if (isCouponInfoStepUrl()) {
      window.history.back();
      return;
    }
    setStep(addCouponStepNames.IMAGE_UPLOAD);
  };

  // 페이지를 떠날 때 남은 미리보기 URL 해제
  useEffect(() => {
    return () => {
      imagePreviewsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

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

  const { mutate: addCoupons, isPending: isAddCouponsPending } = useMutation({
    ...addCouponsOption(queryClient, {
      onSuccess: () => {
        addToast({
          message: "새로운 쿠폰이 추가되었어요",
        });
        hideModal();
        router.push(ROUTES.HOME);
      },
      onError: () => {
        addToast({
          message: "쿠폰 추가에 실패했어요",
        });
        hideModal();
      },
    }),
  });

  useEffect(() => {
    updateModal({ confirmButtonDisabled: isAddCouponsPending });
  }, [isAddCouponsPending, updateModal]);

  const handleSubmit = async (data: AddCouponFormValues) => {
    if (!selectedOrgId) {
      addToast({
        message: "그룹을 선택해 주세요",
      });
      return;
    }

    const groupedMap = new Map<
      string,
      { place: string; name: string; expire_at: string; count: number }
    >();
    for (const c of data.coupons) {
      const key = `${c.place}|${c.name}|${c.expire_at}`;
      const existing = groupedMap.get(key);
      if (existing) existing.count += 1;
      else groupedMap.set(key, { ...c, count: 1 });
    }
    const grouped = Array.from(groupedMap.values());

    showModal({
      title: "이대로 등록할까요?",
      content: (
        <ul className="flex flex-col gap-1">
          {grouped.map((g, idx) => (
            <li key={idx}>
              [{g.place}] {g.name} · {getYYYYMMDD(g.expire_at)}까지
              {g.count > 1 && ` (${g.count}개)`}
            </li>
          ))}
        </ul>
      ),
      confirmButtonText: "등록",
      onConfirm: () => {
        addCoupons({ formValues: data, orgId: selectedOrgId });
      },
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
                    isSubmitting={isAddCouponsPending}
                    submitLabel={submitLabel}
                    onBackToImages={goToImageUploadStep}
                  />
                </div>
              </FullView>
            )}
          </FunnelStep>
        </Funnel>
      </form>
    </FormProvider>
  );
}

export default AddCouponFunnel;
