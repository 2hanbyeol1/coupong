"use client";
import { cn } from "@/shared/lib/util/cn";
import ToggleButton from "@/shared/ui/ToggleButton/ToggleButton";

import { useNotificationStore } from "../../model/store";

interface NotificationSettingProps {
  title: string;
  description?: string;
  onChange: (isChecked: boolean) => void;
  isChecked: boolean;
}

function NotificationSetting({
  title,
  description,
  onChange,
  isChecked,
}: NotificationSettingProps) {
  const { isNotificationEnabled } = useNotificationStore();

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 py-2",
        !isNotificationEnabled && "opacity-50", // disabled
      )}
    >
      <div className="flex flex-col gap-1">
        <div className="font-medium">{title}</div>
        {description && (
          <div className="text-dark text-sm font-medium">{description}</div>
        )}
      </div>
      <ToggleButton
        disabled={!isNotificationEnabled}
        onChange={(isChecked) => {
          onChange(isChecked);
        }}
        checked={isChecked}
      />
    </div>
  );
}

export default NotificationSetting;
