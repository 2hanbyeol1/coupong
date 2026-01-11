"use client";
import { PropsWithChildren, useEffect, useRef } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";

import { useNotificationStore } from "@/entities/notification/model/store";
import { useOrganizationStore } from "@/entities/organization/model/store";
import { getMyInfoOption } from "@/entities/user/api/query";

import useNotification from "../hook/useNotification";
import createClient from "../supabase/client";

function NotificationProvider({ children }: PropsWithChildren) {
  const { subscribeToPush, unsubscribeFromPush, sendNotification } =
    useNotification();
  const { isNotificationEnabled, isCouponRegistrationNotiEnabled } =
    useNotificationStore();
  const { selectedOrganizationId } = useOrganizationStore();
  const { data: user } = useQuery(getMyInfoOption());

  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!isNotificationEnabled) {
      unsubscribeFromPush();
      return;
    }
    subscribeToPush();

    if (!isCouponRegistrationNotiEnabled) {
      channelRef.current?.unsubscribe();
      channelRef.current = null;
      return;
    }

    if (!user) return;

    const supabase = createClient();

    channelRef.current = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          schema: "public", // Subscribes to the "public" schema in Postgres
          event: "INSERT",
          table: "coupons",
          filter: `organization_id=eq.${selectedOrganizationId}`,
        },
        (payload) => {
          sendNotification(
            "새로운 쿠폰이 등록되었어요",
            `[${payload.new.place}] ${payload.new.name}`,
          );
        },
      )
      .subscribe();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedOrganizationId,
    isNotificationEnabled,
    isCouponRegistrationNotiEnabled,
  ]);

  return <>{children}</>;
}

export default NotificationProvider;
