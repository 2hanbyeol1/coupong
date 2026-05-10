"use client";
import { PropsWithChildren, useEffect } from "react";

import { useNotificationStore } from "@/entities/notification/model/store";

import useNotification from "../hook/useNotification";

function NotificationProvider({ children }: PropsWithChildren) {
  const { subscribeToPush, unsubscribeFromPush } = useNotification();
  const { isNotificationEnabled } = useNotificationStore();

  useEffect(() => {
    if (isNotificationEnabled) {
      subscribeToPush();
    } else {
      unsubscribeFromPush();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNotificationEnabled]);

  return <>{children}</>;
}

export default NotificationProvider;
