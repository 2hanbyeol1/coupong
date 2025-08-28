import { useQuery } from "@tanstack/react-query";
import { User } from "lucide-react";

import { getUserOption } from "@/entities/user/api/query";
import { ImageInput } from "@/shared/ui";
import Skeleton from "@/shared/ui/Skeleton";

function UserProfileWidget() {
  const { data: user, isPending, isError } = useQuery(getUserOption());

  // !
  if (isPending)
    return (
      <div className="flex items-center gap-6">
        <Skeleton className="h-20 w-20 rounded-full" />

        <Skeleton className="w-20" textSize="3xl" />
      </div>
    );
  if (isError) return <div>에러</div>;

  return (
    <div className="flex items-center gap-6">
      <ImageInput
        className="h-20 w-20 rounded-full duration-200 hover:-translate-y-2"
        previewImageClassName="object-cover"
        aspect="square"
        previewImageIcon={<User className="stroke-dark" size={32} />}
      />

      <div className="text-3xl font-semibold text-nowrap duration-200 hover:-translate-y-2">
        {user.name}
      </div>
    </div>
  );
}

export default UserProfileWidget;
