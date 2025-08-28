import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

import { cn } from "@/shared/lib/util/cn";
import Skeleton from "@/shared/ui/Skeleton";

import { getCouponImageOption } from "../../api/query";

import { CommonCouponImageProps } from "./CouponImage";

interface CouponImageWithCouponInfoProps extends CommonCouponImageProps {
  imagePath: string;
  couponName: string;
}

function CouponImageWithCouponInfo({
  imagePath,
  couponName,
  isInvalid,
  imageClassName,
}: CouponImageWithCouponInfoProps) {
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
      />
    </div>
  );
}

export default CouponImageWithCouponInfo;
