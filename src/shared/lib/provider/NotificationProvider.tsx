"use client";
import { PropsWithChildren, useEffect } from "react";

import { useNotificationStore } from "@/entities/notification/model/store";

import useNotification from "../hook/useNotification";

function NotificationProvider({ children }: PropsWithChildren) {
  const { syncPushSubscription } = useNotification();
  const { isNotificationEnabled } = useNotificationStore();

  // 앱을 열 때와 알림 설정을 바꿀 때 이 기기의 구독을 설정에 맞춤
  useEffect(() => {
    syncPushSubscription(isNotificationEnabled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNotificationEnabled]);

  return <>{children}</>;
}

export default NotificationProvider;
