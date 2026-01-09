import { create } from "zustand";
import { persist } from "zustand/middleware";

import { NotificationOptionsType } from "../lib/type";

export const NOTIFICATION_STORE_KEY = "notification";

interface NotificationStoreType {
  isNotificationEnabled: boolean;
  isCouponRegistrationNotiEnabled: boolean;
  toggleNotificationEnabled: () => void;
  toggleNotificationOption: (name: keyof NotificationOptionsType) => void;
}

export const useNotificationStore = create<NotificationStoreType>()(
  persist(
    (set) => ({
      isNotificationEnabled: false,
      isCouponRegistrationNotiEnabled: false,
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
