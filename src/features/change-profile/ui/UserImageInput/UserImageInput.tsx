import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "lucide-react";

import { getUserImageUrl, uploadUserImage } from "@/entities/user/api/api";
import {
  getUserOption,
  updateUserProfileOption,
} from "@/entities/user/api/query";
import { USER_QUERY_KEY } from "@/entities/user/api/query-key";
import useToast from "@/shared/lib/hook/useToast";
import { cn } from "@/shared/lib/util/cn";
import { ImageInput } from "@/shared/ui";
import Skeleton from "@/shared/ui/Skeleton";

interface UserImageInputProps {
  className?: string;
}

function UserImageInput({ className }: UserImageInputProps) {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isPending, isError } = useQuery(getUserOption(""));
  const { mutate: updateUserProfile } = useMutation({
    ...updateUserProfileOption(),
    onSuccess: () => {
      addToast({
        message: "사용자 프로필 이미지가 수정되었어요",
        type: "success",
        duration: 3000,
      });
      queryClient.invalidateQueries({
        queryKey: USER_QUERY_KEY.USER(""),
      });
    },
    onError: () => {
      addToast({
        message: "사용자 프로필 이미지 수정에 실패했어요",
        type: "error",
        duration: 3000,
      });
    },
  });

  if (isPending) return <Skeleton className="h-20 w-20 rounded-full" />;
  if (isError) return <div>에러</div>;

  return (
    <ImageInput
      className={cn(
        "h-20 w-20 rounded-full duration-200 hover:-translate-y-1.5",
        className,
      )}
      defaultImageUrl={getUserImageUrl(user.image_path)}
      previewImageIcon={<User className="stroke-dark" size={32} />}
      previewImageClassName="object-cover"
      aspect="square"
      onImageChange={({ imageFile }) => {
        uploadUserImage(imageFile).then((imagePath) => {
          updateUserProfile({ image_path: imagePath });
        });
      }}
    />
  );
}

export default UserImageInput;
