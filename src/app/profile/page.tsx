"use client";

import { FullView } from "@/shared/ui/FullView";
import { Header } from "@/widgets/header";
import MyGroupListWidget from "@/widgets/profile/ui/MyGroupListWidget";
import UserProfileWidget from "@/widgets/profile/ui/UserProfileWidget";

function ProfilePage() {
  return (
    <div className="relative">
      <Header title="" withBackButton />

      <FullView className="px-6 py-6" withHeader>
        <UserProfileWidget />

        <MyGroupListWidget className="mt-16" />
      </FullView>
    </div>
  );
}

export default ProfilePage;
