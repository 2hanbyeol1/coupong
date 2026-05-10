import { createClient } from "@supabase/supabase-js";

import { Database } from "@/shared/config/database.types";

// Service role 키를 사용하는 서버 전용 클라이언트.
// RLS 를 우회하므로 보호된 API 라우트(Webhook secret 검증 후) 에서만 사용할 것.
export default function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다",
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
