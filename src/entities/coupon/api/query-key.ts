import { CouponType } from "./type";

export const COUPON_QUERY_KEY = {
  ALL: ["coupon"],
  LIST: ["coupon", "list"],
  DETAIL: (couponId: CouponType["id"]) => ["coupon", couponId],
  COUPON_IMAGE: (imagePath: CouponType["image_path"]) => [
    "coupon",
    "image",
    imagePath,
  ],
};
