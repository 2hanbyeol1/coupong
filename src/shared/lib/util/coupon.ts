import { CouponType } from "@/entities/coupon/api/type";

import { getExpired } from "./date";

export const getCouponStatus = (coupon: CouponType) => {
  const isExpired = getExpired(coupon.expire_at);
  const isUsed = !!coupon.used_by;
  const isInvalid = isExpired || isUsed;

  return { isExpired, isUsed, isInvalid };
};
