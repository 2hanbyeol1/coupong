"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { getCouponDetailOption } from "@/entities/coupon/api/query";
import { CouponImage } from "@/entities/coupon/ui/CouponImage";
import { UseCouponButton } from "@/features/use-coupon/ui/UseCouponButton";
import { getCouponStatus } from "@/shared/lib/util/coupon";
import { getYYYYMMDD } from "@/shared/lib/util/date";
import { Button } from "@/shared/ui";
import { CenteredView } from "@/shared/ui/CenteredView";
import { Header } from "@/widgets/header";

function CouponDetailPage() {
  const { couponId } = useParams<{ couponId: string }>();
  const [isOpen, setIsOpen] = useState(false); // 쿠폰 열기 상태

  const {
    data: coupon,
    isPending: isCouponPending,
    isError: isCouponError,
  } = useQuery(getCouponDetailOption(parseInt(couponId)));

  // !
  if (isCouponPending || isCouponError) return null;

  const { isExpired, isUsed, isInvalid } = getCouponStatus(coupon);

  const getInvalidMessage = () => {
    if (isUsed)
      return `${coupon.use_username?.name}님이 이미 사용한 쿠폰이예요`;
    if (isExpired) return "기간이 지나 사용할 수 없는 쿠폰이예요";
    return "";
  };

  const handleOpenCoupon = () => {
    setIsOpen(true);
  };

  const handleCloseCoupon = () => {
    setIsOpen(false);
  };

  if (isOpen)
    return (
      <CenteredView>
        <Header title="" withBackButton onBack={handleCloseCoupon} />

        <CouponImage
          couponName={coupon.name}
          imagePath={coupon.image_path}
          isInvalid={isInvalid}
          imageClassName="object-contain"
        />
      </CenteredView>
    );

  return (
    <CenteredView className="relative">
      <Header title="" withBackButton withOrganizationButton />

      <div className="relative top-0 left-0 h-full w-full brightness-90">
        <CouponImage couponName={coupon.name} imagePath={coupon.image_path} />
      </div>

      <div className="absolute flex min-w-80 flex-col gap-5 rounded-xl bg-white px-6 py-6 shadow-lg">
        <div className="flex flex-col gap-8">
          <div>
            <div className="text-dark mb-2 text-sm">{coupon.place}</div>
            <div className="mb-1 text-lg font-medium">{coupon.name}</div>
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
    </CenteredView>
  );
}

export default CouponDetailPage;
