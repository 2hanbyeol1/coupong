import {
  DEFAULT_EXPIRY_REMINDER_DAYS,
  ExpiryReminderDay,
} from "@/shared/config/notification";
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

// 마감 daysBefore일 전 알림을 받을 사용자만 남김
// 설정이 없는 사용자는 기본값(마감 알림 켬, 1일 전만)으로 간주
export async function filterUsersByExpiryReminder(
  userIds: string[],
  daysBefore: ExpiryReminderDay,
): Promise<string[]> {
  if (userIds.length === 0) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("user_notification_preferences")
    .select("user_id, expiring_soon, expiring_soon_days")
    .in("user_id", userIds);

  if (error) {
    // 조회에 실패하면 기본값(1일 전)만 보내 원치 않는 알림을 줄임
    console.error("알림 설정 조회 실패, 기본값으로 발송", error);
    return DEFAULT_EXPIRY_REMINDER_DAYS.includes(daysBefore) ? userIds : [];
  }

  const prefsByUser = new Map((data ?? []).map((row) => [row.user_id, row]));
  return userIds.filter((id) => {
    const pref = prefsByUser.get(id);
    if (!pref) return DEFAULT_EXPIRY_REMINDER_DAYS.includes(daysBefore);
    return pref.expiring_soon && pref.expiring_soon_days.includes(daysBefore);
  });
}
