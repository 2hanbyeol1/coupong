"use client";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { addCouponOption } from "@/entities/coupon/api/query";
import { useOrganizationStore } from "@/entities/organization/model/store";
import { ROUTES } from "@/shared/config/routes";
import useFunnel from "@/shared/lib/hook/useFunnel";
import useToast from "@/shared/lib/hook/useToast";
import { Button, Funnel, FunnelStep } from "@/shared/ui";
import { FullView } from "@/shared/ui/FullView";

import { AddCouponFormValues, addCouponSchema } from "../../lib/schema";

import { CouponImageUploader } from "./Steps/CouponImageUploader";
import { CouponInfoInputs } from "./Steps/CouponInfoInputs";

const addCouponStepNames = {
  IMAGE_UPLOAD: "image-upload",
  COUPON_TITLE: "coupon-title",
};

function AddCouponFunnel() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { step, setStep } = useFunnel(addCouponStepNames.IMAGE_UPLOAD);
  const { selectedOrganizationId: selectedOrgId } = useOrganizationStore();

  const [couponImage, setCouponImage] = useState<string | null>(null);

  const methods = useForm<AddCouponFormValues>({
    mode: "onChange",
    resolver: zodResolver(addCouponSchema),
  });

  const { mutate: addCoupon, isPending: isAddCouponPending } = useMutation({
    ...addCouponOption(queryClient, {
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

    addCoupon({ coupon: data, orgId: selectedOrgId });
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)}>
        <Funnel currentStep={step}>
          {/* 1-1) 일반 등록 - 기프티콘 이미지 업로드 */}
          <FunnelStep name={addCouponStepNames.IMAGE_UPLOAD}>
            <FullView className="relative" withHeader={true}>
              <CouponImageUploader
                onNext={() => setStep(addCouponStepNames.COUPON_TITLE)}
                onImageChange={({ imageUrl }) => {
                  setCouponImage(imageUrl);
                }}
              />
            </FullView>
          </FunnelStep>

          {/* 1-2) 일반 등록 - 쿠폰 정보 입력 */}
          <FunnelStep name={addCouponStepNames.COUPON_TITLE}>
            {couponImage && (
              <FullView className="relative" withHeader={true}>
                <div className="flex h-full w-full flex-col justify-between gap-16 p-4">
                  <CouponInfoInputs couponImage={couponImage} />
                  <Button
                    type="submit"
                    size="lg"
                    full
                    disabled={isAddCouponPending}
                  >
                    {isAddCouponPending ? "등록 중..." : "등록"}
                  </Button>
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
