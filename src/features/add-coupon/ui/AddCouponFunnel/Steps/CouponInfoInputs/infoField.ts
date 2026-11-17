import { UseFormClearErrors, UseFormSetValue } from "react-hook-form";

import {
  AddCouponFormValues,
  CouponInfoFormValues,
} from "@/features/add-coupon/lib/schema";
import {
  COUPON_INFO_FIELD_ORDER,
  decodeCouponKind,
  encodeCouponKind,
  formatCouponKind,
} from "@/features/add-coupon/lib/util";
import { formatKoreanDate } from "@/shared/lib/util/date";

/** 글자로 입력하는 항목 */
export type TextFieldName = (typeof COUPON_INFO_FIELD_ORDER)[number];

/**
 * 한 번에 입력에서 '모두 같게'를 켜고 끄는 항목
 * couponKind: 종류(교환권 / 금액권)와 금액을 묶은 항목
 */
export type InfoFieldName = TextFieldName | "couponKind";

/**
 * 한 번에 입력 화면에서 '모두 같게'를 켜고 끄는 항목 순서
 * 종류(금액권 체크)는 쿠폰 이름 칸 바로 아래에 그리고, 모두 같게도 쿠폰 이름을 따름
 */
export const INFO_FIELD_ORDER = COUPON_INFO_FIELD_ORDER;

/** 함께 '모두 같게'가 켜지고 꺼지는 항목 */
const LINKED_SHARED_FIELDS: Partial<Record<InfoFieldName, InfoFieldName[]>> = {
  name: ["couponKind"],
};

/** field와 함께 모두 같게가 바뀌는 항목들 (field 포함) */
export const getLinkedSharedFields = (
  field: InfoFieldName,
): InfoFieldName[] => [field, ...(LINKED_SHARED_FIELDS[field] ?? [])];

export const FIELD_LABELS: Record<InfoFieldName, string> = {
  place: "사용처",
  name: "쿠폰 이름",
  expire_at: "유효 기간",
  couponKind: "종류",
};

/** 항목 값을 글자 하나로 (종류는 "exchange" / "amount:30000") */
export const getInfoFieldValue = (
  coupon: Partial<CouponInfoFormValues> | undefined,
  field: InfoFieldName,
) =>
  field === "couponKind" ? encodeCouponKind(coupon) : (coupon?.[field] ?? "");

/** 같게 할 값을 고를 때 보여줄 글자 */
export const formatInfoFieldValue = (field: InfoFieldName, value: string) => {
  if (field === "expire_at") return formatKoreanDate(value);
  if (field === "couponKind") return formatCouponKind(decodeCouponKind(value));
  return value;
};

interface SetInfoFieldOptions {
  setValue: UseFormSetValue<AddCouponFormValues>;
  clearErrors: UseFormClearErrors<AddCouponFormValues>;
  /** 글자 항목을 바로 검사할지 (종류는 금액을 입력했을 때만 검사) */
  shouldValidate?: boolean;
}

/** index번째 쿠폰의 항목 값을 바꿈 */
export const setInfoFieldValue = (
  index: number,
  field: InfoFieldName,
  value: string,
  { setValue, clearErrors, shouldValidate = true }: SetInfoFieldOptions,
) => {
  if (field !== "couponKind") {
    setValue(`coupons.${index}.${field}`, value, {
      shouldValidate,
      shouldDirty: true,
    });
    return;
  }

  const { type, face_value } = decodeCouponKind(value);
  setValue(`coupons.${index}.type`, type, { shouldDirty: true });
  if (face_value !== undefined) {
    // 금액권으로 막 바꿔 금액이 비어 있을 때는 아직 오류를 띄우지 않음
    setValue(`coupons.${index}.face_value`, face_value, {
      shouldValidate: shouldValidate && face_value !== "",
      shouldDirty: true,
    });
  }
  // 교환권은 금액을 보지 않으므로 남아 있던 금액 오류를 지움
  if (type === "exchange") clearErrors(`coupons.${index}.face_value`);
};
