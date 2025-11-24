import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";

import { getCouponDetailOption } from "@/entities/coupon/api/query";
import { CouponType } from "@/entities/coupon/api/type";
import { Avatar } from "@/entities/user/ui/Avatar";
import { UseCouponButton } from "@/features/use-coupon/ui/UseCouponButton";
import { cn } from "@/shared/lib/util/cn";
import { getCouponStatus } from "@/shared/lib/util/coupon";
import { getYYYYMMDD } from "@/shared/lib/util/date";
import { Button } from "@/shared/ui";

import CouponDetailWidgetSkeleton from "./CouponDetailWidgetSkeleton";

interface CouponDetailWidgetProps {
  className?: string;
  couponId: CouponType["id"];
}

function CouponDetailWidget({ className, couponId }: CouponDetailWidgetProps) {
  const [isCouponInfoVisible, setIsCouponInfoVisible] = useState(false);

  const {
    data: coupon,
    isPending,
    isError,
  } = useQuery(getCouponDetailOption(couponId));

  if (isPending) return <CouponDetailWidgetSkeleton className={className} />;
  if (isError) return <div>에러</div>;

  const { isExpired, isUsed, isInvalid } = getCouponStatus(coupon);

  const toggleCouponInfo = () => {
    setIsCouponInfoVisible((prev) => !prev);
  };

  const getInvalidMessage = () => {
    if (isUsed)
      return `${coupon.use_username?.name}님이 이미 사용한 쿠폰이예요`;
    if (isExpired) return "기간이 지나 사용할 수 없는 쿠폰이예요";
    return "";
  };

  return (
    <div
      className={cn("flex w-full flex-col gap-5 bg-white px-4 py-3", className)}
    >
      <div className="flex flex-col">
        <AnimatePresence>
          {isCouponInfoVisible && (
            <motion.div
              exit={{ height: 0, paddingBottom: 0 }}
              className="pt-2 pb-6"
            >
              <div className="flex h-full flex-col gap-1 overflow-hidden">
                <div className="flex flex-col gap-2">
                  <div className="text-dark text-sm">{coupon.place}</div>
                  <div className="text-lg font-medium">{coupon.name}</div>
                </div>
                <div className="flex justify-between gap-2">
                  <div className="text-sm">
                    {getYYYYMMDD(coupon.expire_at)}까지 사용
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Avatar userId={coupon.uploaded_by} size={24} />
                    <div className="text-sm">{coupon.upload_username.name}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isInvalid ? (
          <div className="text-dark text-center text-sm">
            {getInvalidMessage()}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button color="light" onClick={toggleCouponInfo}>
              {isCouponInfoVisible ? "닫기" : "쿠폰 정보"}
            </Button>
            <UseCouponButton couponId={coupon.id} />
          </div>
        )}
      </div>
    </div>
  );
}

export default CouponDetailWidget;
