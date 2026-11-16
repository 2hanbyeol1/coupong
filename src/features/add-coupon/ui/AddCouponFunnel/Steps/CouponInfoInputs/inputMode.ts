import { CouponInfoFormValues } from "@/features/add-coupon/lib/schema";

/** batch: 여러 쿠폰을 한 화면에서 입력, single: 쿠폰마다 따로 입력 */
export type CouponInputMode = "batch" | "single";

/** 처음 정보 입력을 시작할 때의 입력 방식 */
export const DEFAULT_COUPON_INPUT_MODE: CouponInputMode = "batch";

/** 한 번에 입력에서 처음부터 모든 쿠폰에 같이 쓰는 항목 */
export const DEFAULT_SHARED_FIELDS: (keyof CouponInfoFormValues)[] = [
  "place",
  "name",
  "expire_at",
];
