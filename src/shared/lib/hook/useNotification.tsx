"use client";
import { useEffect, useState } from "react";

import { subscribeUser, unsubscribeUser } from "@/app/actions";
import { useSubscriptionStore } from "@/entities/notification/model/store";

import createBrowserClient from "../supabase/client";
import { getIsNotificationSupported } from "../util/notification";

const SYNCED_SUBSCRIPTION_KEY = "push-subscription-synced";
/** 서버에서 구독이 지워졌을 수도 있으니 이 기간이 지나면 다시 저장 */
const RESYNC_INTERVAL_MS = 24 * 60 * 60 * 1000;

/** 서버에 마지막으로 저장한 구독 (사용자·endpoint)과 저장한 시각 */
interface SyncedSubscription {
  key: string;
  syncedAt: number;
}

const readSyncedSubscription = (): SyncedSubscription | null => {
  try {
    return JSON.parse(localStorage.getItem(SYNCED_SUBSCRIPTION_KEY) ?? "null");
  } catch {
    return null;
  }
};

const writeSyncedSubscription = (synced: SyncedSubscription | null) => {
  try {
    if (synced) {
      localStorage.setItem(SYNCED_SUBSCRIPTION_KEY, JSON.stringify(synced));
    } else {
      localStorage.removeItem(SYNCED_SUBSCRIPTION_KEY);
    }
  } catch {
    // 저장하지 못하면 다음에 앱을 열 때 서버에 다시 저장할 뿐
  }
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

function useNotification() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null); // ! null이면 값을 가져오는 중..? 비동기가 아닌데 뭐지
  const { subscription, setSubscription } = useSubscriptionStore();

  useEffect(() => {
    const isSupported = getIsNotificationSupported();
    setIsSupported(isSupported);

    if (isSupported) {
      registerServiceWorker();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  /**
   * 이 기기의 푸시 구독을 알림 설정(isEnabled)에 맞춤 (앱을 열 때, 설정을 바꿀 때)
   * 서버 액션이 끝날 때까지 화면의 다른 요청이 밀리므로(측정 시 약 2초),
   * 서버에 저장된 구독과 달라졌을 때만 서버 액션을 부름
   */
  async function syncPushSubscription(isEnabled: boolean) {
    if (!getIsNotificationSupported()) return;

    // 로그인 전에는 서버에 저장할 수 없음 (로그인하면 페이지를 새로 열며 다시 맞춤)
    const { data } = await createBrowserClient().auth.getSession();
    const userId = data.session?.user.id;
    if (!userId) return;

    const registration = await navigator.serviceWorker.ready;
    const current = await registration.pushManager.getSubscription();

    if (!isEnabled) {
      // 이 기기에 구독이 없으면 서버에서 지울 것도 없음
      if (!current) return;
      await current.unsubscribe();
      setSubscription(null);
      writeSyncedSubscription(null);
      await unsubscribeUser(current.endpoint);
      return;
    }

    const sub =
      current ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        ),
      }));
    setSubscription(sub);

    // 다른 계정으로 로그인했거나 endpoint가 바뀌었으면 서버에 다시 저장
    const key = `${userId} ${sub.endpoint}`;
    const synced = readSyncedSubscription();
    if (
      synced?.key === key &&
      Date.now() - synced.syncedAt < RESYNC_INTERVAL_MS
    )
      return;

    const result = await subscribeUser(JSON.parse(JSON.stringify(sub)));
    if (result.success) writeSyncedSubscription({ key, syncedAt: Date.now() });
  }

  return {
    isSupported,
    subscription,
    syncPushSubscription,
  };
}

export default useNotification;
