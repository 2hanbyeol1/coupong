import { FieldErrors } from "react-hook-form";

import {
  COUPON_KIND_LABEL,
  DEFAULT_COUPON_KIND,
} from "@/entities/coupon/lib/amount";
import { formatAmountDigits } from "@/shared/lib/util/money";

import { CouponInfoFormValues } from "./schema";

/** 글자로 입력하는 칸 (입력칸 순서대로) */
export const COUPON_INFO_FIELD_ORDER = [
  "place",
  "name",
  "expire_at",
] as const satisfies readonly (keyof CouponInfoFormValues)[];

/** 잘못 입력한 칸을 찾는 순서 (화면 순서대로, 금액은 유효 기간 바로 위) */
export const COUPON_INFO_ERROR_ORDER = [
  "place",
  "name",
  "face_value",
  "expire_at",
] as const satisfies readonly (keyof CouponInfoFormValues)[];

/** 사진을 처음 고른 쿠폰의 입력값 */
export const EMPTY_COUPON_INFO: CouponInfoFormValues = {
  place: "",
  name: "",
  expire_at: "",
  type: DEFAULT_COUPON_KIND,
  face_value: "",
};

export function getFirstCouponInfoError(
  fieldErrors: FieldErrors<CouponInfoFormValues> | undefined,
): { field: keyof CouponInfoFormValues; message: string } | undefined {
  if (!fieldErrors) return undefined;
  for (const field of COUPON_INFO_ERROR_ORDER) {
    const message = fieldErrors[field]?.message;
    if (message) return { field, message: message as string };
  }
  return undefined;
}

export function isCouponInfoIncomplete(
  values: Partial<CouponInfoFormValues> | undefined,
  fieldErrors: FieldErrors<CouponInfoFormValues> | undefined,
): boolean {
  if (!values) return true;
  for (const field of COUPON_INFO_FIELD_ORDER) {
    const value = values[field];
    if (typeof value !== "string" || value.trim().length === 0) return true;
    if (fieldErrors?.[field]) return true;
  }
  // 금액권이면 금액도 입력해야 함
  if (values.type === "amount" && !values.face_value) return true;
  if (fieldErrors?.face_value) return true;
  return false;
}

/**
 * '종류' 항목 (교환권 / 금액권 + 금액)을 다른 항목처럼 글자 하나로 다룸
 * 한 번에 입력에서 '모두 같게'로 값을 비교하고 고를 때 씀
 * - 교환권: "exchange"
 * - 금액권: "amount:30000" (금액을 아직 안 넣었으면 "amount:")
 */
const AMOUNT_PREFIX = "amount:";

export const encodeCouponKind = (
  coupon:
    | Partial<Pick<CouponInfoFormValues, "type" | "face_value">>
    | undefined,
) =>
  (coupon?.type ?? DEFAULT_COUPON_KIND) === "amount"
    ? `${AMOUNT_PREFIX}${coupon?.face_value ?? ""}`
    : "exchange";

export const decodeCouponKind = (
  value: string,
): Pick<CouponInfoFormValues, "type"> &
  Partial<Pick<CouponInfoFormValues, "face_value">> =>
  value.startsWith(AMOUNT_PREFIX)
    ? { type: "amount", face_value: value.slice(AMOUNT_PREFIX.length) }
    : // 교환권으로 바꿔도 입력해 둔 금액은 남겨, 다시 금액권으로 바꾸면 그대로 보임
      { type: "exchange" };

/** "교환권" / "금액권 30,000원" / "금액권 (금액 미입력)" */
export const formatCouponKind = (
  coupon:
    | Partial<Pick<CouponInfoFormValues, "type" | "face_value">>
    | undefined,
) => {
  const type = coupon?.type ?? DEFAULT_COUPON_KIND;
  if (type !== "amount") return COUPON_KIND_LABEL[type];
  return coupon?.face_value
    ? `${COUPON_KIND_LABEL.amount} ${formatAmountDigits(coupon.face_value)}원`
    : `${COUPON_KIND_LABEL.amount} (금액 미입력)`;
};
