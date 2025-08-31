"use client";
import { useState } from "react";
import { useParams } from "next/navigation";

import { CouponImage } from "@/entities/coupon/ui/CouponImage";
import { CenteredView } from "@/shared/ui/CenteredView";
import CouponDetailWidget from "@/widgets/coupon/ui/CouponDetailWidget";
import { Header } from "@/widgets/header";

function CouponDetailPage() {
  const { couponId } = useParams<{ couponId: string }>();
  const [isOpen, setIsOpen] = useState(false); // 쿠폰 열기 상태

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

        <CouponImage couponId={couponId} imageClassName="object-contain" />
      </CenteredView>
    );

  return (
    <CenteredView className="relative">
      <Header title="" withBackButton withOrganizationButton />

      <div className="relative top-0 left-0 h-full w-full brightness-90">
        <CouponImage couponId={couponId} />
      </div>

      <CouponDetailWidget
        couponId={couponId}
        handleOpenCoupon={handleOpenCoupon}
      />
    </CenteredView>
  );
}

export default CouponDetailPage;
