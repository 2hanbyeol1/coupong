"use client";
import z from "zod";

export const COUPON_SCHEMA = {
  name: z.string().min(1, "쿠폰의 이름을 입력해주세요"),
  place: z
    .string("쿠폰의 사용처를 입력해주세요")
    .min(1, "쿠폰의 사용처를 입력해주세요"),
  expire_at: z
    .string("쿠폰의 유효 기간을 입력해주세요")
    .min(1, "쿠폰의 유효 기간을 입력해주세요"),
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
