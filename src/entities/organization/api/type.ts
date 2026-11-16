import { Enums, Tables, TablesInsert } from "@/shared/config/database.types";

export type OrganizationType = Tables<"organizations">;

export type InsertOrganizationType = TablesInsert<"organizations">;

export type OrganizationRole = Enums<"organization_role">;
