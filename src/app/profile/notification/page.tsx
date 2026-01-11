import NotificationSettingList from "@/features/set-notification/ui/NotificationSettingList/NotificationSettingList";
import NotificationSubscribeToggleButton from "@/features/set-notification/ui/NotificationSubscribeToggleButton/NotificationSubscribeToggleButton";
import { getIsNotificationSupported } from "@/shared/lib/util/notification";
import { InfoMessage } from "@/shared/ui/InfoMessage";
import { Header } from "@/widgets/header";

function NotificationPage() {
  const isSupported = getIsNotificationSupported();

  if (!isSupported) {
    return (
      <div className="relative">
        <Header withBackButton />
        <div className="flex flex-col gap-5 px-6 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-medium">알림</h1>
          </div>
          <InfoMessage
            title="알림 기능을 지원하지 않는 브라우저예요"
            description={`알림 기능을 지원하는 브라우저로 접속해주세요.\nIOS의 경우 홈 화면에 추가해야 해요.`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Header withBackButton />
      <div className="flex flex-col gap-5 px-6 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium">알림</h1>
          <NotificationSubscribeToggleButton />
        </div>
        <NotificationSettingList />
      </div>
    </div>
  );
}

export default NotificationPage;
