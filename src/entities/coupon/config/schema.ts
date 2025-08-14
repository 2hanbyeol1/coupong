import z from "zod";

export const COUPON_SCHEMA = {
  name: z.string().min(1, "쿠폰명을 입력해주세요"),
  place: z.string().min(1, "쿠폰의 사용처를 입력해주세요"),
  expire_at: z.string().min(1, "쿠폰의 만료일을 입력해주세요"),
  imageFile: z
    .instanceof(FileList, { error: "파일을 업로드해주세요" })
    .refine((fileList) => [...fileList].length === 1, {
      message: "쿠폰 이미지를 업로드해주세요",
    }),
};
