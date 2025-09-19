import { Tables, TablesInsert } from "@/shared/config/database.types";

export type InvitationType = Tables<"invitations">;

export type InsertInvitationType = TablesInsert<"invitations">;
