import webpush, { WebPushError } from "web-push";

import createAdminClient from "@/shared/lib/supabase/admin";

import "server-only";

let vapidConfigured = false;

function ensureVapid() {
  if (vapidConfigured) return;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:2hanbyeol1@naver.com";

  if (!publicKey || !privateKey) {
    throw new Error(
      "VAPID 키가 설정되어 있지 않아요 (NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY)",
    );
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

// 주어진 user_id 들에게 푸시 발송. 만료된 endpoint 는 자동 삭제.
export async function sendPushToUsers(userIds: string[], payload: PushPayload) {
  if (userIds.length === 0) return { sent: 0, removed: 0 };
  ensureVapid();

  const supabase = createAdminClient();
  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .in("user_id", userIds);

  if (error) throw error;
  if (!subscriptions || subscriptions.length === 0) {
    return { sent: 0, removed: 0 };
  }

  const body = JSON.stringify(payload);
  const expiredIds: string[] = [];
  let sent = 0;

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          body,
        );
        sent += 1;
      } catch (err) {
        if (
          err instanceof WebPushError &&
          (err.statusCode === 404 || err.statusCode === 410)
        ) {
          expiredIds.push(sub.id);
        } else {
          console.error("푸시 발송 실패", sub.endpoint, err);
        }
      }
    }),
  );

  if (expiredIds.length > 0) {
    await supabase.from("push_subscriptions").delete().in("id", expiredIds);
  }

  return { sent, removed: expiredIds.length };
}
