"use client";
import { useEffect, useState } from "react";
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

function AddCouponFunnel() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { showModal, hideModal } = useModal();
  const { step, setStep } = useFunnel(addCouponStepNames.IMAGE_UPLOAD);
  const { selectedOrganizationId: selectedOrgId } = useOrganizationStore();

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [currentCouponIndex, setCurrentCouponIndex] = useState(0);

  const methods = useForm<AddCouponFormValues>({
    mode: "onChange",
    resolver: zodResolver(addCouponSchema),
    defaultValues: { coupons: [] },
  });

  // 더 이상 사용하지 않는 미리보기 URL 해제
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const handleImagesChange = (files: File[]) => {
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
    setCurrentCouponIndex(0);
  };

  const { mutate: addCoupons, isPending: isAddCouponsPending } = useMutation({
    ...addCouponsOption(queryClient, {
      onSuccess: () => {
        addToast({
          message: "새로운 쿠폰이 추가되었어요",
          type: "success",
        });
        router.push(ROUTES.HOME);
      },
      onError: () => {
        addToast({
          message: "쿠폰 추가에 실패했어요",
          type: "error",
        });
      },
    }),
  });

  const handleSubmit = async (data: AddCouponFormValues) => {
    if (!selectedOrgId) {
      addToast({
        message: "그룹을 선택해 주세요",
        type: "error",
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
        hideModal();
      },
    });
  };

  const handleInvalid: SubmitErrorHandler<AddCouponFormValues> = (errors) => {
    if (errors.imageFile?.message) {
      addToast({ message: errors.imageFile.message as string, type: "error" });
      return;
    }

    const couponErrors = errors.coupons;
    if (!Array.isArray(couponErrors)) return;

    for (let index = 0; index < couponErrors.length; index++) {
      const firstError = getFirstCouponInfoError(couponErrors[index]);
      if (firstError) {
        addToast({ message: firstError.message, type: "error" });
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
                onNext={() => setStep(addCouponStepNames.COUPON_INFO)}
                imagePreviews={imagePreviews}
                onImagesChange={handleImagesChange}
              />
            </FullView>
          </FunnelStep>

          {/* 2) 이미지별 쿠폰 정보 입력 */}
          <FunnelStep name={addCouponStepNames.COUPON_INFO}>
            {imagePreviews.length > 0 && (
              <FullView className="relative" withHeader={true}>
                <div className="flex h-full w-full flex-col justify-between gap-16 p-4">
                  <CouponInfoInputs
                    imagePreviews={imagePreviews}
                    currentIndex={currentCouponIndex}
                    onCurrentIndexChange={setCurrentCouponIndex}
                    isSubmitting={isAddCouponsPending}
                    submitLabel={submitLabel}
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
