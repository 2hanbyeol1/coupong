import z from "zod";

export const USER_SCHEMA = {
  name: z
    .string()
    .min(1, "사용자 이름을 입력해주세요")
    .max(8, "사용자 이름은 8자 이하로 입력해주세요")
    .regex(
      /^[a-z|A-Z|0-9|ㄱ-ㅎ|가-힣]+$/,
      "사용자 이름은 영문/한글만 입력해주세요",
    ),
};
