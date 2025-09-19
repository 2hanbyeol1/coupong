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
import { Funnel, FunnelStep } from "@/shared/ui";
import { FullView } from "@/shared/ui/FullView";

import { AddCouponFormValues, addCouponSchema } from "../../lib/schema";

import { CouponImageUploader } from "./Steps/CouponImageUploader";
import { CouponInfoInputs } from "./Steps/CouponInfoInputs";

const addCouponStepNames = ["image-upload", "coupon-title", "success"];

function AddCouponFunnel() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { step, setStep } = useFunnel("image-upload");
  const { selectedOrganizationId: selectedOrgId } = useOrganizationStore();

  const [couponImage, setCouponImage] = useState<string | null>(null);

  const { mutate: addCoupon, isPending: isAddCouponPending } = useMutation({
    ...addCouponOption(queryClient),
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
  });

  const methods = useForm<AddCouponFormValues>({
    mode: "onChange",
    resolver: zodResolver(addCouponSchema),
  });

  const handleSubmit = async (data: AddCouponFormValues) => {
    if (!selectedOrgId) {
      addToast({
        message: "그룹을 선택해주세요",
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
          <FunnelStep name={addCouponStepNames[0]}>
            <FullView className="relative" withHeader={true}>
              <CouponImageUploader
                onNext={() => setStep(addCouponStepNames[1])}
                onImageChange={({ imageUrl }) => {
                  setCouponImage(imageUrl);
                }}
              />
            </FullView>
          </FunnelStep>

          <FunnelStep name={addCouponStepNames[1]}>
            {couponImage && (
              <FullView className="relative" withHeader={true}>
                <CouponInfoInputs
                  couponImage={couponImage}
                  isSubmitting={isAddCouponPending}
                />
              </FullView>
            )}
          </FunnelStep>
        </Funnel>
      </form>
    </FormProvider>
  );
}

export default AddCouponFunnel;
