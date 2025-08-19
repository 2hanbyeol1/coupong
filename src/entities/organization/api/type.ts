import { Tables, TablesInsert } from "@/shared/config/database.types";

export type OrganizationType = Tables<"organization">;

export type InsertOrganizationType = TablesInsert<"organization">;
