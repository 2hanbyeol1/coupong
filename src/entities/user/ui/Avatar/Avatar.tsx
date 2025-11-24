import { useQuery } from "@tanstack/react-query";
import { cva, VariantProps } from "class-variance-authority";
import Image from "next/image";

import Skeleton from "@/shared/ui/Skeleton";

import { getUserImageUrl } from "../../api/api";
import { getUserOption } from "../../api/query";

const avatarVariants = cva(
  "relative flex items-center justify-center rounded-full overflow-hidden whitespace-nowrap",
  {
    variants: {
      color: {
        primary: "bg-primary text-white",
        secondary: "bg-light text-primary",
        none: "",
      },
      size: {
        16: "h-4 w-4 text-xs",
        24: "h-6 w-6 text-sm",
        28: "h-7 w-7 text-sm",
        80: "h-20 w-20 text-2xl",
      },
    },
    defaultVariants: {
      color: "primary",
      size: 24,
    },
  },
);

interface AvatarProps extends VariantProps<typeof avatarVariants> {
  userId?: string; // ""이면 본인 아바타
}

function Avatar({ color, size, userId = "" }: AvatarProps) {
  const {
    data: user,
    isPending,
    isError,
  } = useQuery({
    ...getUserOption(userId),
  });

  if (isPending)
    return <Skeleton className={avatarVariants({ size, color: "none" })} />;
  if (isError) return <div>에러</div>;

  const imageSource = getUserImageUrl(user.image_path);

  return (
    <div className={avatarVariants({ size, color })}>
      {imageSource ? (
        <Image
          className="object-cover"
          src={imageSource ?? ""}
          alt={user.name}
          fill
        />
      ) : (
        user.name[0]
      )}
    </div>
  );
}

export default Avatar;
