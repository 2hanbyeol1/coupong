"use client";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { addCoupon } from "@/entities/coupon/api/api";
import { ROUTES } from "@/shared/config/routes";
import useFunnel from "@/shared/lib/hook/useFunnel";
import useToast from "@/shared/lib/hook/useToast";
import { Funnel, FunnelStep } from "@/shared/ui";
import { FullView } from "@/shared/ui/FullView";

import { AddCouponFormValues, addCouponSchema } from "../../config/schema";

import { CouponImageUploader } from "./Steps/CouponImageUploader";
import { CouponInfoInputs } from "./Steps/CouponInfoInputs";

const addCouponStepNames = ["image-upload", "coupon-title", "success"];

function AddCouponFunnel() {
  const [couponImage, setCouponImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { step, setStep } = useFunnel("image-upload");
  const router = useRouter();
  const { addToast } = useToast();

  const methods = useForm<AddCouponFormValues>({
    mode: "onChange",
    resolver: zodResolver(addCouponSchema),
  });

  const handleSubmit = async (data: AddCouponFormValues) => {
    setIsSubmitting(true);
    try {
      await addCoupon(data);
      addToast({
        message: "새로운 쿠폰이 추가되었어요",
        type: "success",
        duration: 3000,
      });
      router.push(ROUTES.HOME);
    } catch (error) {
      addToast({
        message:
          error instanceof Error
            ? error.message
            : "알 수 없는 에러가 발생했어요",
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
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
                  isSubmitting={isSubmitting}
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
