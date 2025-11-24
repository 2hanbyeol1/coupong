import {
  COUPON_INFO_MAX_LENGTH,
  COUPON_INFO_MIN_LENGTH,
} from "@/entities/coupon/lib/schema";

export const INPUT_CONFIG = [
  {
    label: "사용처",
    name: "place",
    type: "text",
    placeholder: "사용처",
    minLength: COUPON_INFO_MIN_LENGTH.place,
    maxLength: COUPON_INFO_MAX_LENGTH.place,
  },
  {
    label: "쿠폰 이름",
    name: "name",
    type: "text",
    placeholder: "쿠폰 이름",
    minLength: COUPON_INFO_MIN_LENGTH.name,
    maxLength: COUPON_INFO_MAX_LENGTH.name,
  },
  {
    label: "유효 기간",
    name: "expire_at",
    type: "date",
    placeholder: "유효 기간",
    required: true,
  },
];
