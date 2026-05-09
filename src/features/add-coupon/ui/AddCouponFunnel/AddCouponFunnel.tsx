"use client";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { addCouponsOption } from "@/entities/coupon/api/query";
import { useOrganizationStore } from "@/entities/organization/model/store";
import { ROUTES } from "@/shared/config/routes";
import useFunnel from "@/shared/lib/hook/useFunnel";
import useToast from "@/shared/lib/hook/useToast";
import { Funnel, FunnelStep } from "@/shared/ui";
import { FullView } from "@/shared/ui/FullView";

import { AddCouponFormValues, addCouponSchema } from "../../lib/schema";

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

    addCoupons({ formValues: data, orgId: selectedOrgId });
  };

  const submitLabel =
    imagePreviews.length > 1 ? `${imagePreviews.length}개 쿠폰 등록` : "등록";

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)}>
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
