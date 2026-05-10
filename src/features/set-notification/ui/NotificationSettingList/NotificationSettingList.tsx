"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getNotificationPreferences,
  NotificationPreferences,
  updateNotificationPreferences,
} from "@/app/actions";
import NotificationSetting from "@/entities/notification/ui/NotificationSetting/NotificationSetting";
import { useOrganizationStore } from "@/entities/organization/model/store";
import useToast from "@/shared/lib/hook/useToast";

const PREFERENCES_QUERY_KEY = ["notification-preferences"] as const;

const DEFAULT_PREFERENCES: NotificationPreferences = {
  coupon_created: true,
  expiring_soon: true,
};

function NotificationSettingList() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const { isHydrated, selectedOrganizationId } = useOrganizationStore();

  const { data: preferences = DEFAULT_PREFERENCES } = useQuery({
    queryKey: PREFERENCES_QUERY_KEY,
    queryFn: getNotificationPreferences,
  });

  const { mutate: savePreferences } = useMutation({
    mutationFn: (next: Partial<NotificationPreferences>) =>
      updateNotificationPreferences(next),
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
      addToast({ message: "알림 설정 저장에 실패했어요", type: "error" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PREFERENCES_QUERY_KEY });
    },
  });

  const guard = () => {
    if (!isHydrated) {
      addToast({ message: "선택된 그룹을 가져오는 중입니다", type: "error" });
      return false;
    }
    if (!selectedOrganizationId) {
      addToast({ message: "그룹을 선택해주세요", type: "error" });
      return false;
    }
    return true;
  };

  return (
    <>
      <NotificationSetting
        title="쿠폰 등록 알림"
        description="현재 선택된 그룹에 쿠폰이 등록되면 알림을 받아요"
        isChecked={preferences.coupon_created}
        onChange={() => {
          if (!guard()) return;
          savePreferences({ coupon_created: !preferences.coupon_created });
        }}
      />
      <NotificationSetting
        title="쿠폰 마감 임박 알림"
        description="등록된 쿠폰의 마감일이 1일 남았을 때 알림을 받아요"
        isChecked={preferences.expiring_soon}
        onChange={() => {
          if (!guard()) return;
          savePreferences({ expiring_soon: !preferences.expiring_soon });
        }}
      />
    </>
  );
}

export default NotificationSettingList;
