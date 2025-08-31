"use client";

import { LogoutButton } from "@/entities/auth/ui";
import { FullView } from "@/shared/ui/FullView";
import { Header } from "@/widgets/header";
import MyOrgsWidget from "@/widgets/profile/ui/MyOrgsWidget";
import UserProfileWidget from "@/widgets/profile/ui/UserProfileWidget";

function ProfilePage() {
  return (
    <div className="relative">
      <Header title="" withBackButton />

      <FullView className="px-6 py-6" withHeader>
        <UserProfileWidget />
        <div className="bg-light mt-6 h-0.5 w-full" />
        <MyOrgsWidget className="mt-10" title="내 그룹" />
        <LogoutButton className="mt-20" />
      </FullView>
    </div>
  );
}

export default ProfilePage;
