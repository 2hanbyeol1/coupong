"use client";
import z from "zod";

import { isDayPassed } from "@/shared/lib/util/date";

export const COUPON_INFO_MAX_LENGTH = {
  name: 20,
  place: 10,
  imageFile: 1,
};

export const COUPON_INFO_MIN_LENGTH = {
  name: 0,
  place: 0,
  imageFile: 1,
};

export const COUPON_SCHEMA = {
  name: z
    .string()
    .max(
      COUPON_INFO_MAX_LENGTH.name,
      `${COUPON_INFO_MAX_LENGTH.name}자 이내로 입력해주세요`,
    ),
  place: z
    .string()
    .max(
      COUPON_INFO_MAX_LENGTH.place,
      `${COUPON_INFO_MAX_LENGTH.place}자 이내로 입력해주세요`,
    ),
  expire_at: z
    .string("쿠폰의 유효 기간을 입력해주세요")
    .refine((dateStr) => !isDayPassed(dateStr), {
      message: "유효 기간이 지난 쿠폰은 등록할 수 없어요",
    }),
  imageFile:
    typeof window === "undefined"
      ? z.any()
      : z
          .instanceof(FileList, {
            message: "쿠폰 이미지를 업로드해주세요",
          })
          .refine((fileList) => [...fileList].length === 1, {
            message: "쿠폰 이미지를 업로드해주세요",
          }),
};
