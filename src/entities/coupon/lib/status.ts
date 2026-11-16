import { getCouponStatus } from "@/shared/lib/util/coupon";

import { CouponType } from "../api/type";

/**
 * 쿠폰 목록 탭
 * - available: 아직 쓰지 않았고 기간이 남은 쿠폰
 * - past: 사용했거나 기간이 지난 쿠폰
 */
export const COUPON_LIST_STATUSES = ["available", "past"] as const;
export type CouponListStatus = (typeof COUPON_LIST_STATUSES)[number];

export const DEFAULT_COUPON_LIST_STATUS: CouponListStatus = "available";

export const COUPON_LIST_STATUS_LABEL: Record<CouponListStatus, string> = {
  available: "사용 가능",
  past: "지난 쿠폰",
};

export const isCouponListStatus = (
  value: string | null,
): value is CouponListStatus =>
  COUPON_LIST_STATUSES.includes(value as CouponListStatus);

/** 쿠폰이 어느 목록 탭에 속하는지 */
export const getCouponListStatus = (coupon: CouponType): CouponListStatus =>
  getCouponStatus(coupon).isInvalid ? "past" : "available";
