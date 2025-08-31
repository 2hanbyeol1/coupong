import { OrganizationType } from "@/entities/organization/api/type";

import { CouponType } from "./type";

export const COUPON_QUERY_KEY = {
  ALL: ["coupon"],
  LIST: (orgId: OrganizationType["id"]) => ["coupon", "list", orgId],
  DETAIL: (couponId: CouponType["id"]) => ["coupon", couponId],
  COUPON_IMAGE: (imagePath: CouponType["image_path"]) => [
    "coupon",
    "image",
    imagePath,
  ],
};
