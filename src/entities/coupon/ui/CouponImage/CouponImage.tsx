import { useQuery } from "@tanstack/react-query";
import { ImageOff } from "lucide-react";
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
  loading?: "eager" | "lazy";
}

function CouponImage({
  imagePath,
  couponName,
  isInvalid,
  imageClassName,
  sizes,
  loading,
}: CouponImageProps) {
  const {
    data: signedUrl,
    isPending,
    isError,
  } = useQuery({
    ...getCouponImageOption({ imagePath }),
    // 사진 한 장을 못 불러와도 목록·상세 화면 전체가 에러 화면으로 바뀌지 않게 함
    throwOnError: false,
  });

  if (isPending) return <Skeleton className="h-full w-full" wrapper />;
  if (isError)
    return (
      <div
        role="img"
        aria-label={`${couponName} 사진을 불러오지 못했어요`}
        className="bg-light flex h-full w-full items-center justify-center"
      >
        <ImageOff aria-hidden className="stroke-dark size-6" />
      </div>
    );

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
        loading={loading}
      />
    </div>
  );
}

export default CouponImage;
