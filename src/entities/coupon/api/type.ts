import { Tables, TablesInsert } from "@/shared/config/database.types";

export type CouponType = Tables<"coupons">;

export type InsertCouponType = TablesInsert<"coupons">;
