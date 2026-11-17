"use client";
import z from "zod";

import { getExpired } from "@/shared/lib/util/date";
import { formatWon } from "@/shared/lib/util/money";

import { CouponKind, MAX_FACE_VALUE, MIN_FACE_VALUE } from "./amount";

export const COUPON_INFO = {
  name: {
    label: "쿠폰 이름",
    name: "name",
    type: "text",
    placeholder: "쿠폰 이름",
    maxLength: 30,
    minLength: 1,
  },
  place: {
    label: "사용처",
    name: "place",
    type: "text",
    placeholder: "사용처",
    maxLength: 10,
    minLength: 1,
  },
  expire_at: {
    label: "유효 기간",
    name: "expire_at",
    type: "date",
    placeholder: "유효 기간",
    required: true,
  },
  face_value: {
    label: "금액",
    name: "face_value",
  },
  imageFile: {
    minLength: 1,
  },
};

export const COUPON_SCHEMA = {
  name: z
    .string()
    .min(COUPON_INFO.name.minLength, "쿠폰 이름을 입력해주세요")
    .max(
      COUPON_INFO.name.maxLength,
      `${COUPON_INFO.name.maxLength}자 이내로 입력해주세요`,
    ),
  place: z
    .string()
    .min(COUPON_INFO.place.minLength, "사용처를 입력해주세요")
    .max(
      COUPON_INFO.place.maxLength,
      `${COUPON_INFO.place.maxLength}자 이내로 입력해주세요`,
    ),
  expire_at: z
    .string()
    .min(1, "쿠폰의 유효 기간을 입력해주세요")
    // 날짜 입력칸은 완성된 날짜일 때만 YYYY-MM-DD 값을 넘김
    .regex(/^\d{4}-\d{2}-\d{2}$/, "유효 기간을 끝까지 정확히 입력해주세요")
    .refine((dateStr) => !getExpired(dateStr), {
      message: "유효 기간이 지난 쿠폰은 등록할 수 없어요",
    }),
  type: z.enum(["exchange", "amount"]) satisfies z.ZodType<CouponKind>,
  /** 금액 입력칸 값 (숫자만, 교환권이면 쓰지 않음) */
  face_value: z.string(),
  imageFile:
    typeof window === "undefined"
      ? z.any()
      : z
          .instanceof(FileList, {
            message: "쿠폰 이미지를 업로드해주세요",
          })
          .refine(
            (fileList) =>
              [...fileList].length >= COUPON_INFO.imageFile.minLength,
            { message: "쿠폰 이미지를 업로드해주세요" },
          ),
};

/**
 * 금액권이면 금액이 있어야 함 (교환권은 금액을 보지 않음)
 * minFaceValue: 이미 쓴 금액이 있으면 그보다 적게 바꿀 수 없음 (수정할 때)
 */
export const refineFaceValue =
  ({ minFaceValue = MIN_FACE_VALUE }: { minFaceValue?: number } = {}) =>
  (values: { type: CouponKind; face_value: string }, ctx: z.RefinementCtx) => {
    if (values.type !== "amount") return;
    const addIssue = (message: string) =>
      ctx.addIssue({ code: "custom", message, path: ["face_value"] });

    if (!values.face_value) {
      addIssue("금액권의 금액을 입력해주세요");
      return;
    }
    const amount = Number(values.face_value);
    if (amount > MAX_FACE_VALUE) {
      addIssue(`금액은 ${formatWon(MAX_FACE_VALUE)}까지 입력할 수 있어요`);
    } else if (amount < minFaceValue) {
      addIssue(
        minFaceValue > MIN_FACE_VALUE
          ? `이미 쓴 ${formatWon(minFaceValue)}보다 적게 바꿀 수 없어요`
          : "금액을 1원 이상 입력해주세요",
      );
    }
  };

export const couponInfoObjectSchema = z.object({
  name: COUPON_SCHEMA.name,
  place: COUPON_SCHEMA.place,
  expire_at: COUPON_SCHEMA.expire_at,
  type: COUPON_SCHEMA.type,
  face_value: COUPON_SCHEMA.face_value,
});

/** 금액 입력칸 값 → 저장할 금액 (교환권은 null) */
export const toFaceValue = (values: {
  type: CouponKind;
  face_value: string;
}) => (values.type === "amount" ? Number(values.face_value) : null);

export type CouponInfoValues = z.infer<typeof couponInfoObjectSchema>;
