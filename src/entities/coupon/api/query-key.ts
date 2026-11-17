import { OrganizationType } from "@/entities/organization/api/type";

import { CouponListStatus } from "../lib/status";

import { CouponType } from "./type";

export const COUPON_QUERY_KEY = {
  ALL: ["coupon"],
  LIST_ALL: ["coupon", "list"],
  LIST: (
    orgId: OrganizationType["id"],
    status: CouponListStatus,
    keyword = "",
  ) => ["coupon", "list", orgId, status, keyword],
  // LIST 아래에 두어, 목록을 새로 불러올 때 개수도 함께 갱신되게 함
  COUNT: (
    orgId: OrganizationType["id"],
    status: CouponListStatus,
    keyword = "",
  ) => ["coupon", "list", orgId, status, keyword, "count"],
  DETAIL: (couponId: CouponType["id"]) => ["coupon", couponId],
  // DETAIL 아래에 두어, 쿠폰 정보를 새로 불러올 때 사용 내역도 함께 갱신되게 함
  USAGES: (couponId: CouponType["id"]) => ["coupon", couponId, "usages"],
  SUGGESTIONS: (params: object) => ["coupon", "suggestions", params],
  COUPON_IMAGE_ALL: ["coupon", "image"],
  COUPON_IMAGE: (imagePath: CouponType["image_path"]) => [
    "coupon",
    "image",
    imagePath,
  ],
};
