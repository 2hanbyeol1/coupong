"use client";
import NotificationSettingList from "@/features/set-notification/ui/NotificationSettingList/NotificationSettingList";
import NotificationSubscribeToggleButton from "@/features/set-notification/ui/NotificationSubscribeToggleButton/NotificationSubscribeToggleButton";
import useNotification from "@/shared/lib/hook/useNotification";
import { InfoMessage } from "@/shared/ui/InfoMessage";

function NotificationSettingListWidget() {
  const { isSupported } = useNotification();

  if (isSupported === false) {
    return (
      <InfoMessage
        title="알림 기능을 지원하지 않는 브라우저예요"
        description="알림 기능을 지원하는 브라우저로 접속해주세요."
      />
    );
  }

  return (
    <div className="flex flex-col gap-5 px-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium">알림</h1>
        <NotificationSubscribeToggleButton />
      </div>
      <NotificationSettingList />
    </div>
  );
}

export default NotificationSettingListWidget;
