"use client";
import z from "zod";

import { isDayPassed } from "@/shared/lib/util/date";

export const COUPON_INFO = {
  name: {
    label: "쿠폰 이름",
    name: "name",
    type: "text",
    placeholder: "쿠폰 이름",
    maxLength: 20,
    minLength: 0,
  },
  place: {
    label: "사용처",
    name: "place",
    type: "text",
    placeholder: "사용처",
    maxLength: 10,
    minLength: 0,
  },
  expire_at: {
    label: "유효 기간",
    name: "expire_at",
    type: "date",
    placeholder: "유효 기간",
    required: true,
  },
  imageFile: {
    maxLength: 1,
    minLength: 0,
  },
};

export const COUPON_SCHEMA = {
  name: z
    .string("쿠폰 이름을 입력해주세요")
    .min(COUPON_INFO.name.minLength, "쿠폰 이름을 입력해주세요")
    .max(
      COUPON_INFO.name.maxLength,
      `${COUPON_INFO.name.maxLength}자 이내로 입력해주세요`,
    ),
  place: z
    .string("사용처를 입력해주세요")
    .max(
      COUPON_INFO.place.maxLength,
      `${COUPON_INFO.place.maxLength}자 이내로 입력해주세요`,
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
