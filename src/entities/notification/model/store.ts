import { create } from "zustand";
import { persist } from "zustand/middleware";

import { NotificationOptionsType } from "../lib/type";

export const NOTIFICATION_STORE_KEY = "notification";

interface NotificationStoreType {
  isNotificationEnabled: boolean;
  subscription: PushSubscription | null;
  isCouponRegistrationNotiEnabled: boolean;
  toggleNotificationEnabled: () => void;
  toggleNotificationOption: (name: keyof NotificationOptionsType) => void;
  setSubscription: (subscription: PushSubscription | null) => void;
}

export const useNotificationStore = create<NotificationStoreType>()(
  persist(
    (set) => ({
      subscription: null,
      isNotificationEnabled: false,
      isCouponRegistrationNotiEnabled: false,
      setSubscription: (subscription: PushSubscription | null) =>
        set({ subscription }),
      toggleNotificationEnabled: () =>
        set((prev) => ({
          isNotificationEnabled: !prev.isNotificationEnabled,
        })),
      toggleNotificationOption: (name) =>
        set((prev) => ({
          [name]: !prev[name],
        })),
    }),
    {
      name: NOTIFICATION_STORE_KEY,
    },
  ),
);
