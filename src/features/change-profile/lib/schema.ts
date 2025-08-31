import { z } from "zod";

import { USER_SCHEMA } from "@/entities/user/lib/schema";

export const changeProfileSchema = z.object({
  name: USER_SCHEMA.name,
});

export type ChangeProfileFormValues = z.infer<typeof changeProfileSchema>;
