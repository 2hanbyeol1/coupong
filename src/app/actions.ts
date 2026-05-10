"use server";

import webpush from "web-push";

import createClient from "@/shared/lib/supabase/server";

type SerializedSubscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export async function subscribeUser(
  sub: webpush.PushSubscription | SerializedSubscription,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "로그인이 필요해요" };
  }

  const { endpoint, keys } = sub as SerializedSubscription;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return { success: false, error: "구독 정보가 올바르지 않아요" };
  }

  // endpoint 가 unique 라 동일 디바이스 재구독 시 user_id 만 갱신됨
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
    { onConflict: "endpoint" },
  );

  if (error) {
    console.error("구독 저장 실패", error);
    return { success: false, error: "구독 저장에 실패했어요" };
  }

  return { success: true };
}

export async function unsubscribeUser(endpoint?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "로그인이 필요해요" };
  }

  const query = supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id);

  const { error } = endpoint
    ? await query.eq("endpoint", endpoint)
    : await query;

  if (error) {
    console.error("구독 삭제 실패", error);
    return { success: false, error: "구독 해제에 실패했어요" };
  }

  return { success: true };
}

export type NotificationPreferences = {
  coupon_created: boolean;
  expiring_soon: boolean;
};

const DEFAULT_PREFERENCES: NotificationPreferences = {
  coupon_created: true,
  expiring_soon: true,
};

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return DEFAULT_PREFERENCES;

  const { data, error } = await supabase
    .from("user_notification_preferences")
    .select("coupon_created, expiring_soon")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("알림 설정 조회 실패", error);
    return DEFAULT_PREFERENCES;
  }

  return data ?? DEFAULT_PREFERENCES;
}

export async function updateNotificationPreferences(
  prefs: Partial<NotificationPreferences>,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "로그인이 필요해요" };
  }

  const { error } = await supabase.from("user_notification_preferences").upsert(
    {
      user_id: user.id,
      ...prefs,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    console.error("알림 설정 저장 실패", error);
    return { success: false, error: "알림 설정 저장에 실패했어요" };
  }

  return { success: true };
}
