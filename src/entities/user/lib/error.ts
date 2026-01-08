import { PostgrestError } from "@supabase/supabase-js";

const USER_NOT_FOUND_ERROR_CODE = "PGRST116";
const NAME_DUPLICATE_ERROR_CODE = "23505";

export const getUserErrorMessage = (error: PostgrestError) => {
  switch (error.code) {
    case USER_NOT_FOUND_ERROR_CODE:
      return "존재하지 않는 사용자예요";
    case NAME_DUPLICATE_ERROR_CODE:
      return "이미 존재하는 이름은 사용할 수 없어요";
  }
  return undefined;
};
