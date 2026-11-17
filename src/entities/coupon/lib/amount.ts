import { Enums } from "@/shared/config/database.types";

import { CouponType } from "../api/type";

/** exchange: 교환권 (한 번 쓰면 끝), amount: 금액권 (쓸 때마다 잔액 차감) */
export type CouponKind = Enums<"coupon_type">;

export const DEFAULT_COUPON_KIND: CouponKind = "exchange";

export const COUPON_KIND_LABEL: Record<CouponKind, string> = {
  exchange: "교환권",
  amount: "금액권",
};

/** 금액권인지 고르는 체크박스 글자 (기본은 교환권) */
export const AMOUNT_CHECK_LABEL = "금액권이에요";

/** 금액권 금액 범위 (원) */
export const MIN_FACE_VALUE = 1;
export const MAX_FACE_VALUE = 10_000_000;
/** 금액 입력칸의 최대 자리 수 (10,000,000 → 8자리) */
export const FACE_VALUE_MAX_DIGITS = String(MAX_FACE_VALUE).length;

/** 금액권 금액 입력칸 아래 더하기 버튼 */
export const FACE_VALUE_QUICK_ADD_AMOUNTS = [
  1_000, 5_000, 10_000, 30_000, 50_000,
] as const;

/** 금액권을 쓸 때 이번에 쓴 금액 입력칸 아래 더하기 버튼 */
export const SPEND_QUICK_ADD_AMOUNTS = [
  10_000, 5_000, 1_000, 500, 100,
] as const;

type AmountFields = Pick<CouponType, "type" | "face_value" | "used_amount">;

export const isAmountCoupon = (coupon: Pick<CouponType, "type">) =>
  coupon.type === "amount";

/** 금액권의 남은 금액 (교환권은 0) */
export const getRemainingAmount = (coupon: AmountFields) =>
  coupon.type === "amount"
    ? Math.max(0, (coupon.face_value ?? 0) - coupon.used_amount)
    : 0;
