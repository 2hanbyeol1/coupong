import { create } from "zustand";
import { persist } from "zustand/middleware";

export const NOTIFICATION_STORE_KEY = "notification";

interface NotificationStoreType {
  isNotificationEnabled: boolean;
  toggleNotificationEnabled: () => void;
}

export const useNotificationStore = create<NotificationStoreType>()(
  persist(
    (set) => ({
      isNotificationEnabled: false,
      toggleNotificationEnabled: () =>
        set((prev) => ({
          isNotificationEnabled: !prev.isNotificationEnabled,
        })),
    }),
    {
      name: NOTIFICATION_STORE_KEY,
    },
  ),
);

interface SubscriptionStoreType {
  subscription: PushSubscription | null;
  setSubscription: (subscription: PushSubscription | null) => void;
}
export const useSubscriptionStore = create<SubscriptionStoreType>()((set) => ({
  subscription: null,
  setSubscription: (subscription) => set({ subscription }),
}));
