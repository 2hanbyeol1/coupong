import { UserImageInput } from "@/features/change-profile/ui/UserImageInput";
import { UserNameInput } from "@/features/change-profile/ui/UserNameInput";

function UserProfileWidget() {
  return (
    <div className="flex items-center gap-6">
      <UserImageInput className="flex-shrink-0" />

      <UserNameInput className="flex-grow" />
    </div>
  );
}

export default UserProfileWidget;
