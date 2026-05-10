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
