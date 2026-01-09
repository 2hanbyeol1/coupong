"use client";
import { useNotificationStore } from "@/entities/notification/model/store";
import NotificationSetting from "@/entities/notification/ui/NotificationSetting/NotificationSetting";
import { useOrganizationStore } from "@/entities/organization/model/store";
import useToast from "@/shared/lib/hook/useToast";

function NotificationSettingList() {
  const { addToast } = useToast();

  const { isHydrated, selectedOrganizationId } = useOrganizationStore();
  const {
    isCouponRegistrationNotiEnabled: isCouponRegistrationNotificationEnabled,
    toggleNotificationOption,
  } = useNotificationStore();

  const handleRegistrationNotificationEnabled = () => {
    if (!isHydrated)
      return addToast({
        message: "선택된 그룹을 가져오는 중입니다",
        type: "error",
      });

    if (!selectedOrganizationId)
      return addToast({ message: "그룹을 선택해주세요", type: "error" });

    toggleNotificationOption("isCouponRegistrationNotiEnabled");
  };

  return (
    <NotificationSetting
      title="쿠폰 등록 알림"
      description="현재 선택된 그룹에 쿠폰이 등록되면 알림을 받아요"
      isChecked={isCouponRegistrationNotificationEnabled}
      onChange={handleRegistrationNotificationEnabled}
    />
  );
}

export default NotificationSettingList;
