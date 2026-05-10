import { FieldErrors } from "react-hook-form";

import { CouponInfoFormValues } from "./schema";

export const COUPON_INFO_FIELD_ORDER = [
  "place",
  "name",
  "expire_at",
] as const satisfies readonly (keyof CouponInfoFormValues)[];

export function getFirstCouponInfoError(
  fieldErrors: FieldErrors<CouponInfoFormValues> | undefined,
): { field: keyof CouponInfoFormValues; message: string } | undefined {
  if (!fieldErrors) return undefined;
  for (const field of COUPON_INFO_FIELD_ORDER) {
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
  return false;
}
