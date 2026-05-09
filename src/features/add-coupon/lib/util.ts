import { FieldErrors } from "react-hook-form";

import { CouponInfoFormValues } from "./schema";

export const COUPON_INFO_FIELD_ORDER = [
  "place",
  "name",
  "expire_at",
] as const satisfies readonly (keyof CouponInfoFormValues)[];

export function getFirstCouponInfoErrorMessage(
  fieldErrors: FieldErrors<CouponInfoFormValues> | undefined,
): string | undefined {
  if (!fieldErrors) return undefined;
  for (const field of COUPON_INFO_FIELD_ORDER) {
    const message = fieldErrors[field]?.message;
    if (message) return message as string;
  }
  return undefined;
}
