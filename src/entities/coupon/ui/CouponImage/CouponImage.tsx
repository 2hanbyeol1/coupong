import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

import { cn } from "@/shared/lib/util/cn";
import Skeleton from "@/shared/ui/Skeleton";

import { getCouponImageOption } from "../../api/query";
import { CouponType } from "../../api/type";

export interface CouponImageProps {
  imagePath: CouponType["image_path"];
  couponName: CouponType["name"];
  isInvalid?: boolean;
  imageClassName?: string;
  sizes: string;
}

function CouponImage({
  imagePath,
  couponName,
  isInvalid,
  imageClassName,
  sizes,
}: CouponImageProps) {
  const {
    data: signedUrl,
    isPending,
    isError,
  } = useQuery(getCouponImageOption({ imagePath }));

  if (isPending) return <Skeleton className="h-full w-full" wrapper />;
  if (isError) return <div>에러</div>;

  return (
    <div className="relative h-full w-full">
      <Image
        src={signedUrl}
        fill
        className={cn(
          "object-cover",
          isInvalid && "opacity-20 brightness-75",
          imageClassName,
        )}
        alt={couponName}
        sizes={sizes}
      />
    </div>
  );
}

export default CouponImage;
