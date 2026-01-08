"use client";
import { useParams } from "next/navigation";

import { CenteredView } from "@/shared/ui/CenteredView";
import CouponDetailWidget from "@/widgets/coupon/ui/CouponDetailWidget";
import { Header } from "@/widgets/header";

import DetailCouponImage from "./_components/DetailCouponImage";

function CouponDetailPage() {
  const { couponId } = useParams<{ couponId: string }>();

  return (
    <CenteredView className="relative">
      <Header title="" withBackButton withOrganizationButton />

      <DetailCouponImage couponId={couponId} />

      <CouponDetailWidget couponId={couponId} />
    </CenteredView>
  );
}

export default CouponDetailPage;
