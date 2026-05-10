import createAdminClient from "@/shared/lib/supabase/admin";

import "server-only";

export type PreferenceKey = "coupon_created" | "expiring_soon";

// row 가 없는 사용자는 default = true (수신) 로 간주.
// 따라서 "해당 prefer 가 명시적으로 false 인 user" 만 빼면 됨.
export async function filterUsersByPreference(
  userIds: string[],
  pref: PreferenceKey,
): Promise<string[]> {
  if (userIds.length === 0) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("user_notification_preferences")
    .select("user_id")
    .in("user_id", userIds)
    .eq(pref, false);

  if (error) {
    console.error("알림 설정 조회 실패, 전체 발송 처리", error);
    return userIds;
  }

  const optedOut = new Set((data ?? []).map((row) => row.user_id));
  return userIds.filter((id) => !optedOut.has(id));
}
