import { useQuery } from "@tanstack/react-query";

import { getCouponDetailOption } from "@/entities/coupon/api/query";
import Skeleton from "@/shared/ui/Skeleton";

import { CouponType } from "../../api/type";

import { CommonCouponImageProps } from "./CouponImage";
import CouponImageWithCouponInfo from "./CouponImageWithCouponInfo";

interface CouponImageWithCouponIdProps extends CommonCouponImageProps {
  couponId: CouponType["id"];
}

function CouponImageWithCouponId({
  couponId,
  ...props
}: CouponImageWithCouponIdProps) {
  const {
    data: coupon,
    isPending,
    isError,
  } = useQuery({
    ...getCouponDetailOption(couponId),
  });

  if (isPending) return <Skeleton className="h-full w-full" wrapper />;
  if (isError) return <div>에러</div>;

  return (
    <CouponImageWithCouponInfo
      imagePath={coupon.image_path}
      couponName={coupon.name}
      {...props}
    />
  );
}

export default CouponImageWithCouponId;
