import { PostgrestError } from "@supabase/supabase-js";

import {
  DUPLICATE_ERROR_CODE,
  NOT_FOUND_ERROR_CODE,
} from "@/shared/lib/constants/error-code";

export const getOrganizationErrorMessage = (error: PostgrestError) => {
  switch (error.code) {
    case NOT_FOUND_ERROR_CODE:
      return "존재하지 않는 그룹이예요";
    case DUPLICATE_ERROR_CODE:
      return "이미 존재하는 그룹 이름은 사용할 수 없어요";
  }
  return undefined;
};
