"use client";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";

import { getInfiniteCouponsOption } from "@/entities/coupon/api/query";
import { Coupon } from "@/entities/coupon/ui/Coupon";
import { InfoMessage } from "@/shared/ui/InfoMessage";

interface CouponListWidgetProps {
  keyword?: string;
}

function CouponListWidget({ keyword }: CouponListWidgetProps) {
  const { ref, inView } = useInView();

  const {
    data: coupons,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(getInfiniteCouponsOption);

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  if (isPending) return <div>로딩</div>;
  if (isError) return <div>에러</div>;

  const filteredCoupons = keyword
    ? coupons.filter((coupon) => coupon.place.includes(keyword))
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
        description="우리 가족을 위해 등록하러 가볼까요?"
      />
    );

  return (
    <div className="flex flex-col gap-2 px-3 pb-6">
      {filteredCoupons.map((coupon) => (
        <Coupon key={coupon.id} coupon={coupon} />
      ))}

      {isFetchingNextPage && (
        <div className="py-4 text-center text-gray-500">
          다음 페이지 로딩 중...
        </div>
      )}
      {hasNextPage && !isFetchingNextPage && <div ref={ref} className="h-4" />}
    </div>
  );
}

export default CouponListWidget;
