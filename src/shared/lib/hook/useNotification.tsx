"use client";
import { useEffect, useState } from "react";

import { subscribeUser, unsubscribeUser } from "@/app/actions";
import { useSubscriptionStore } from "@/entities/notification/model/store";

import { getIsNotificationSupported } from "../util/notification";

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

  async function subscribeToPush() {
    if (subscription) return;

    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      ),
    });
    setSubscription(sub);
    const serializedSub = JSON.parse(JSON.stringify(sub));
    await subscribeUser(serializedSub);
  }

  async function unsubscribeFromPush() {
    const endpoint = subscription?.endpoint;
    await subscription?.unsubscribe();
    setSubscription(null);
    await unsubscribeUser(endpoint);
  }

  return {
    isSupported,
    subscription,
    unsubscribeFromPush,
    subscribeToPush,
  };
}

export default useNotification;
