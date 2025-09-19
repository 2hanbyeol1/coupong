"use client";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";

import { getInfiniteCouponsOption } from "@/entities/coupon/api/query";
import { Coupon } from "@/entities/coupon/ui/Coupon";
import CouponSkeleton from "@/entities/coupon/ui/Coupon/CouponSkeleton";
import { useOrganizationStore } from "@/entities/organization/model/store";
import { InfoMessage } from "@/shared/ui/InfoMessage";

interface CouponListWidgetProps {
  keyword?: string;
}

function CouponListWidget({ keyword }: CouponListWidgetProps) {
  const { ref, inView } = useInView();
  const { selectedOrganizationId: selectedOrgId } = useOrganizationStore();

  const {
    data: coupons,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    ...getInfiniteCouponsOption(selectedOrgId ?? ""),
    enabled: !!selectedOrgId,
  });

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  if (!selectedOrgId)
    return (
      <InfoMessage
        title="그룹을 선택해 주세요"
        description="쿠폰을 확인하려면 그룹을 선택해 주세요"
      />
    );

  if (isPending)
    return (
      <div className="flex flex-col gap-2 px-3 pb-6">
        <CouponSkeleton count={10} />
      </div>
    );
  if (isError) return <div>에러</div>;

  const filteredCoupons = keyword
    ? coupons.filter(
        (coupon) =>
          coupon.place.toUpperCase().includes(keyword) ||
          coupon.name.toUpperCase().includes(keyword),
      )
    : coupons;

  if (!!keyword && filteredCoupons.length === 0)
    return (
      <InfoMessage
        title="검색된 쿠폰이 없어요"
        description="다른 키워드로 검색해보세요"
      />
    );

  if (filteredCoupons.length === 0)
    return (
      <InfoMessage
        title="등록된 쿠폰이 없어요"
        description="화면 하단의 버튼을 눌러 등록해보세요"
      />
    );

  return (
    <div className="flex flex-col gap-2 px-3 pb-6">
      {filteredCoupons.map((coupon) => (
        <Coupon key={coupon.id} coupon={coupon} />
      ))}

      {isFetchingNextPage && <CouponSkeleton count={10} />}
      {hasNextPage && !isFetchingNextPage && <div ref={ref} className="h-4" />}
    </div>
  );
}

export default CouponListWidget;
