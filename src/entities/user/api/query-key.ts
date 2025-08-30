import { UserType } from "./type";

export const USER_QUERY_KEY = {
  USER: (userId: UserType["user_id"]) => ["user", userId],
  GROUP_LIST: ["user-group", "list"],
} as const;
