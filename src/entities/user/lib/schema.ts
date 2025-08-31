import z from "zod";

export const USER_SCHEMA = {
  name: z
    .string()
    .min(1, "사용자의 이름을 입력해주세요")
    .max(8, "사용자의 이름은 8자 이하로 입력해주세요"),
};
