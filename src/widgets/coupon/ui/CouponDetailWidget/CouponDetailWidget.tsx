import { useQuery } from "@tanstack/react-query";

import { getCouponDetailOption } from "@/entities/coupon/api/query";
import { CouponType } from "@/entities/coupon/api/type";
import { UseCouponButton } from "@/features/use-coupon/ui/UseCouponButton";
import { getCouponStatus } from "@/shared/lib/util/coupon";
import { getYYYYMMDD } from "@/shared/lib/util/date";
import { Button } from "@/shared/ui";
import Skeleton from "@/shared/ui/Skeleton";

interface CouponDetailWidgetProps {
  couponId: CouponType["id"];
  handleOpenCoupon: () => void;
}

function CouponDetailWidget({
  couponId,
  handleOpenCoupon,
}: CouponDetailWidgetProps) {
  const {
    data: coupon,
    isPending,
    isError,
  } = useQuery(getCouponDetailOption(couponId));

  if (isPending)
    return (
      <Skeleton
        className="absolute flex min-w-80 flex-col gap-5 rounded-xl bg-white px-6 py-6 shadow-lg"
        wrapper
      >
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-1">
            <div className="flex flex-col gap-2">
              <Skeleton className="w-8" textSize="sm" />
              <Skeleton className="w-52" textSize="lg" />
            </div>
            <div className="flex justify-between gap-2">
              <Skeleton textSize="xs" className="w-36" />
              <Skeleton textSize="xs" className="w-8" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </Skeleton>
    );
  if (isError) return <div>에러</div>;

  const { isExpired, isUsed, isInvalid } = getCouponStatus(coupon);

  const getInvalidMessage = () => {
    if (isUsed)
      return `${coupon.use_username?.name}님이 이미 사용한 쿠폰이예요`;
    if (isExpired) return "기간이 지나 사용할 수 없는 쿠폰이예요";
    return "";
  };

  return (
    <div className="absolute flex min-w-80 flex-col gap-5 rounded-xl bg-white px-6 py-6 shadow-lg">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <div className="flex flex-col gap-2">
            <div className="text-dark text-sm">{coupon.place}</div>
            <div className="text-lg font-medium">{coupon.name}</div>
          </div>
          <div className="flex justify-between gap-2">
            <div className="text-xs">
              {getYYYYMMDD(coupon.expire_at)}까지 사용
            </div>
            <div className="text-xs">{coupon.upload_username.name}</div>
          </div>
        </div>

        {isInvalid ? (
          <div className="text-dark mb-3 text-center text-sm">
            {getInvalidMessage()}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button color="light" onClick={handleOpenCoupon}>
              쿠폰 열기
            </Button>
            <UseCouponButton couponId={coupon.id} />
          </div>
        )}
      </div>
    </div>
  );
}

export default CouponDetailWidget;
