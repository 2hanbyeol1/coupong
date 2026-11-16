"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getNotificationPreferences,
  NotificationPreferences,
  updateNotificationPreferences,
} from "@/app/actions";
import { useNotificationStore } from "@/entities/notification/model/store";
import NotificationSetting from "@/entities/notification/ui/NotificationSetting/NotificationSetting";
import {
  DEFAULT_EXPIRY_REMINDER_DAYS,
  EXPIRY_REMINDER_DAYS,
  ExpiryReminderDay,
} from "@/shared/config/notification";
import useToast from "@/shared/lib/hook/useToast";
import ToggleChip from "@/shared/ui/ToggleChip/ToggleChip";

const PREFERENCES_QUERY_KEY = ["notification-preferences"] as const;

const DEFAULT_PREFERENCES: NotificationPreferences = {
  coupon_created: true,
  expiring_soon: true,
  expiring_soon_days: DEFAULT_EXPIRY_REMINDER_DAYS,
};

function NotificationSettingList() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const { isNotificationEnabled } = useNotificationStore();

  const { data: preferences = DEFAULT_PREFERENCES } = useQuery({
    queryKey: PREFERENCES_QUERY_KEY,
    queryFn: getNotificationPreferences,
  });

  const { mutate: savePreferences, isPending } = useMutation({
    mutationFn: async (next: Partial<NotificationPreferences>) => {
      const result = await updateNotificationPreferences(next);
      if (!result.success) throw new Error(result.error);
    },
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: PREFERENCES_QUERY_KEY });
      const previous = queryClient.getQueryData<NotificationPreferences>(
        PREFERENCES_QUERY_KEY,
      );
      queryClient.setQueryData<NotificationPreferences>(
        PREFERENCES_QUERY_KEY,
        (prev) => ({ ...(prev ?? DEFAULT_PREFERENCES), ...next }),
      );
      return { previous };
    },
    onError: (_error, _next, context) => {
      if (context?.previous) {
        queryClient.setQueryData(PREFERENCES_QUERY_KEY, context.previous);
      }
      addToast({ message: "알림 설정 저장에 실패했어요" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PREFERENCES_QUERY_KEY });
    },
  });

  const toggleExpiryDay = (day: ExpiryReminderDay) => {
    if (isPending) return;
    const days = preferences.expiring_soon_days;
    const next = days.includes(day)
      ? days.filter((d) => d !== day)
      : [...days, day];
    // 마감 알림을 끄려면 위의 토글을 쓰도록, 날은 하나 이상 남김
    if (next.length === 0) {
      addToast({ message: "알림 받을 날을 하나 이상 골라주세요" });
      return;
    }
    savePreferences({ expiring_soon_days: next });
  };

  return (
    <div className="flex flex-col gap-2">
      <NotificationSetting
        title="쿠폰 등록 알림"
        description="내 그룹에 새 쿠폰이 등록되면 알림을 받아요"
        isChecked={preferences.coupon_created}
        onChange={() => {
          if (isPending) return;
          savePreferences({ coupon_created: !preferences.coupon_created });
        }}
      />
      <NotificationSetting
        title="쿠폰 마감 임박 알림"
        description="쿠폰 마감일이 다가오면 골라둔 날에 알림을 받아요"
        isChecked={preferences.expiring_soon}
        onChange={() => {
          if (isPending) return;
          savePreferences({ expiring_soon: !preferences.expiring_soon });
        }}
      />
      {preferences.expiring_soon && (
        <div
          role="group"
          aria-label="마감 알림 받을 날"
          className="-mt-1 flex gap-1.5"
        >
          {EXPIRY_REMINDER_DAYS.map((day) => (
            <ToggleChip
              key={day}
              pressed={preferences.expiring_soon_days.includes(day)}
              onChange={() => toggleExpiryDay(day)}
              disabled={!isNotificationEnabled}
              className="disabled:cursor-default disabled:opacity-50"
            >
              {day}일 전
            </ToggleChip>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationSettingList;
