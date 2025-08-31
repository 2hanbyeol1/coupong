import { z } from "zod";

import { COUPON_SCHEMA } from "@/entities/coupon/lib/schema";

// 폼 스키마 정의
export const addCouponSchema = z.object({
  name: COUPON_SCHEMA.name,
  place: COUPON_SCHEMA.place,
  expire_at: COUPON_SCHEMA.expire_at,
  imageFile: COUPON_SCHEMA.imageFile,
});

// 폼 값 타입
export type AddCouponFormValues = z.infer<typeof addCouponSchema>;
