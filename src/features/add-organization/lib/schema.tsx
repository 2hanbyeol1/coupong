import { z } from "zod";

import { ORGANIZATION_SCHEMA } from "@/entities/organization/lib/schema";

// 폼 스키마 정의
export const addOrganizationSchema = z.object({
  name: ORGANIZATION_SCHEMA.name,
});

// 폼 값 타입
export type AddOrganizationFormValues = z.infer<typeof addOrganizationSchema>;
