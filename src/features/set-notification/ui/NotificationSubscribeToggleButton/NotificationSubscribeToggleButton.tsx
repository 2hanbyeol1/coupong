"use client";
import { useNotificationStore } from "@/entities/notification/model/store";
import ToggleButton from "@/shared/ui/ToggleButton/ToggleButton";

function NotificationSubscribeToggleButton() {
  const { isNotificationEnabled, toggleNotificationEnabled } =
    useNotificationStore();

  return (
    <ToggleButton
      checked={isNotificationEnabled}
      onChange={toggleNotificationEnabled}
    />
  );
}

export default NotificationSubscribeToggleButton;
