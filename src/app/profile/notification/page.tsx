import { Header } from "@/widgets/header";
import NotificationSettingListWidget from "@/widgets/notification/ui/NotificationSettingListWidget/NotificationSettingListWidget";

function NotificationPage() {
  return (
    <div className="relative">
      <Header withBackButton />
      <NotificationSettingListWidget />
    </div>
  );
}

export default NotificationPage;
