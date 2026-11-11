"use client";
import { useEffect } from "react";
import { Controller, SubmitErrorHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateCouponOption } from "@/entities/coupon/api/query";
import { CouponType } from "@/entities/coupon/api/type";
import {
  COUPON_INFO,
  couponInfoObjectSchema,
  CouponInfoValues,
} from "@/entities/coupon/lib/schema";
import useModal from "@/shared/lib/hook/useModal";
import useToast from "@/shared/lib/hook/useToast";
import { getTodayDateInputValue } from "@/shared/lib/util/date";
import { DateInput, TextInput } from "@/shared/ui";

const TEXT_INPUT_CONFIG = [
  { ...COUPON_INFO.place },
  { ...COUPON_INFO.name },
] as const;

export interface EditCouponFormProps {
  coupon: CouponType;
  formId: string;
}

function EditCouponForm({ coupon, formId }: EditCouponFormProps) {
  const queryClient = useQueryClient();
  const { hideModal, updateModal } = useModal();
  const { addToast } = useToast();

  const { register, control, handleSubmit } = useForm<CouponInfoValues>({
    mode: "onChange",
    resolver: zodResolver(couponInfoObjectSchema),
    defaultValues: {
      place: coupon.place,
      name: coupon.name,
      expire_at: coupon.expire_at.slice(0, 10),
    },
  });

  const { mutate: updateCoupon, isPending } = useMutation({
    ...updateCouponOption(queryClient, {
      onSuccess: () => {
        addToast({ message: "쿠폰이 수정되었어요" });
        hideModal();
      },
      onError: (error) => {
        addToast({ message: error.message });
      },
    }),
  });

  useEffect(() => {
    updateModal({ confirmButtonDisabled: isPending });
  }, [isPending, updateModal]);

  const onSubmit = (data: CouponInfoValues) => {
    updateCoupon({ couponId: coupon.id, changes: data });
  };

  const onInvalid: SubmitErrorHandler<CouponInfoValues> = (errors) => {
    const first =
      errors.place?.message ??
      errors.name?.message ??
      errors.expire_at?.message;
    if (first) addToast({ message: String(first) });
  };

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit, onInvalid)}>
      <div className="flex flex-col gap-3 text-left">
        {TEXT_INPUT_CONFIG.map(({ name, ...props }) => (
          <TextInput
            key={name}
            {...props}
            {...register(name as keyof CouponInfoValues)}
          />
        ))}
        <Controller
          control={control}
          name="expire_at"
          render={({ field }) => (
            <DateInput
              ref={field.ref}
              name={field.name}
              label={COUPON_INFO.expire_at.label}
              required={COUPON_INFO.expire_at.required}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              min={getTodayDateInputValue()}
            />
          )}
        />
      </div>
    </form>
  );
}

export default EditCouponForm;
