import Link from "next/link";

import { LogoutButton } from "@/entities/auth/ui";
import { ROUTES } from "@/shared/config/routes";
import { FullView } from "@/shared/ui/FullView";
import { Header } from "@/widgets/header";
import ProfileMenu from "@/widgets/profile/ui/ProfileMenu";
import ProfileMenuTitle from "@/widgets/profile/ui/ProfileMenuTitle";
import UserProfileWidget from "@/widgets/profile/ui/UserProfileWidget";

function ProfilePage() {
  return (
    <div className="relative">
      <Header title="" withBackButton />

      <FullView className="px-6 py-6" withHeader>
        <UserProfileWidget />
        <div className="bg-light mt-6 mb-8 h-0.5 w-full" />
        <ProfileMenuTitle title="설정" />
        <div className="flex flex-col">
          <ProfileMenu menu="알림" link={ROUTES.PROFILE_NOTIFICATION} />
          <ProfileMenu menu="내 그룹" link={ROUTES.PROFILE_ORGANIZATION} />
        </div>

        <LogoutButton className="mt-40" />
        <Link className="mt-auto opacity-0" href="/test">
          실험실
        </Link>
      </FullView>
    </div>
  );
}

export default ProfilePage;
