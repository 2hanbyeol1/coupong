import { useQuery } from "@tanstack/react-query";

import { getCouponDetailOption } from "@/entities/coupon/api/query";
import { CouponImage } from "@/entities/coupon/ui/CouponImage";
import Skeleton from "@/shared/ui/Skeleton";

function DetailCouponImage({ couponId }: { couponId: string }) {
  const {
    data: coupon,
    isPending,
    isError,
  } = useQuery(getCouponDetailOption(couponId));

  if (isPending) return <Skeleton className="h-full w-full" wrapper />;
  if (isError) return <div>에러</div>;

  return (
    <div className="relative top-0 left-0 h-full w-full">
      <CouponImage
        imagePath={coupon.image_path}
        couponName={coupon.name}
        imageClassName="object-cover"
      />
    </div>
  );
}

export default DetailCouponImage;
