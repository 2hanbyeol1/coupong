"use client";
import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { getInfiniteCouponsOption } from "@/entities/coupon/api/query";
import { Coupon } from "@/entities/coupon/ui/Coupon";
import CouponSkeleton from "@/entities/coupon/ui/Coupon/CouponSkeleton";
import { useOrganizationStore } from "@/entities/organization/model/store";
import { InfiniteScroll } from "@/shared/ui/InfiniteScroll";
import { InfoMessage } from "@/shared/ui/InfoMessage";

interface CouponListWidgetProps {
  keyword?: string;
}

function CouponListWidget({ keyword }: CouponListWidgetProps) {
  const { selectedOrganizationId: selectedOrgId } = useOrganizationStore();

  const {
    data: coupons,
    isPending,
    isError,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    ...getInfiniteCouponsOption(selectedOrgId ?? ""),
    enabled: !!selectedOrgId,
  });

  const filteredCoupons = useMemo(
    () =>
      keyword && coupons
        ? coupons.filter(
            (coupon) =>
              coupon.place.toUpperCase().includes(keyword) ||
              coupon.name.toUpperCase().includes(keyword),
          )
        : (coupons ?? []),
    [coupons, keyword],
  );

  if (!selectedOrgId)
    return (
      <InfoMessage
        title="그룹을 선택해 주세요"
        description="쿠폰을 확인하려면 그룹을 선택해 주세요"
      />
    );

  if (isPending)
    return (
      <div className="flex flex-col gap-2 px-3 pt-1 pb-6">
        <CouponSkeleton count={10} />
      </div>
    );

  if (isError)
    return (
      <InfoMessage
        title="쿠폰을 불러오는 중 오류가 발생했습니다"
        description="잠시 후 다시 시도해 주세요"
      />
    );

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
    <InfiniteScroll
      className="gap-2 px-3 pt-1 pb-6"
      loader={<CouponSkeleton count={10} />}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
    >
      {filteredCoupons.map((coupon) => (
        <Coupon key={coupon.id} coupon={coupon} />
      ))}
    </InfiniteScroll>
  );
}

export default CouponListWidget;
