import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

import { cn } from "@/shared/lib/util/cn";

import { getCouponImageOption } from "../../api/query";
import { CouponType } from "../../api/type";

function CouponImage({
  couponName,
  imagePath,
  isInvalid,
  imageClassName,
}: {
  couponName: CouponType["name"];
  imagePath: CouponType["image_path"];
  isInvalid?: boolean;
  imageClassName?: string;
}) {
  const {
    data: signedUrl,
    isPending,
    isError,
  } = useQuery(getCouponImageOption({ imagePath }));

  if (isPending) return <div className="bg-light h-full w-full"></div>;
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

export default CouponImage;
