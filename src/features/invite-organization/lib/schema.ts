import { z } from "zod";

// 폼 스키마 정의
export const inviteOrganizationSchema = z.object({
  email: z.email("이메일을 입력해주세요"),
});

// 폼 값 타입
export type InviteOrganizationFormValues = z.infer<
  typeof inviteOrganizationSchema
>;
