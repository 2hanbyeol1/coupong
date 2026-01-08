import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Maximize2, Minimize2 } from "lucide-react";

import { getCouponDetailOption } from "@/entities/coupon/api/query";
import { CouponImage } from "@/entities/coupon/ui/CouponImage";
import Skeleton from "@/shared/ui/Skeleton";

function DetailCouponImage({ couponId }: { couponId: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    data: coupon,
    isPending,
    isError,
  } = useQuery(getCouponDetailOption(couponId));

  if (isPending) return <Skeleton className="h-full w-full" wrapper />;
  if (isError) return <div>에러</div>;

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className="relative w-full flex-grow">
      <CouponImage
        imagePath={coupon.image_path}
        couponName={coupon.name}
        imageClassName={isExpanded ? "object-contain" : "object-cover"}
      />
      <button
        className="absolute right-4 bottom-2 rounded-full bg-white p-2 shadow-lg"
        onClick={toggleExpanded}
      >
        {isExpanded ? (
          <Minimize2 className="stroke-dark size-6" />
        ) : (
          <Maximize2 className="stroke-dark size-6" />
        )}
      </button>
    </div>
  );
}

export default DetailCouponImage;
