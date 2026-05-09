import { z } from "zod";

import { COUPON_SCHEMA } from "@/entities/coupon/lib/schema";

// 개별 쿠폰 정보 스키마 (이미지 1장당 1개)
export const couponInfoSchema = z.object({
  name: COUPON_SCHEMA.name,
  place: COUPON_SCHEMA.place,
  expire_at: COUPON_SCHEMA.expire_at,
});

export type CouponInfoFormValues = z.infer<typeof couponInfoSchema>;

// 폼 스키마 정의 - 이미지 여러 장 + 쿠폰 정보 배열
export const addCouponSchema = z.object({
  imageFile: COUPON_SCHEMA.imageFile,
  coupons: z.array(couponInfoSchema).min(1),
});

// 폼 값 타입
export type AddCouponFormValues = z.infer<typeof addCouponSchema>;
