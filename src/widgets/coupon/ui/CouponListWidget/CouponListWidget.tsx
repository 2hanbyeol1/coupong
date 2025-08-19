"use client";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";

import { getInfiniteCouponsOption } from "@/entities/coupon/api/query";
import { Coupon } from "@/entities/coupon/ui/Coupon";

function CouponListWidget() {
  const {
    data: coupons,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(getInfiniteCouponsOption);
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (isPending) return <div>로딩</div>;
  if (isError) return <div>에러</div>;
  if (coupons.length === 0)
    return (
      <div className="flex flex-col items-center justify-center px-3 pt-6 pb-6">
        <div className="text-sm font-medium">등록된 쿠폰이 없어요</div>
        <div className="text-sm text-gray-500">
          우리 가족을 위해 등록하러 가볼까요?
        </div>
      </div>
    );

  return (
    <div className="flex flex-col gap-2 px-3 pb-6">
      {coupons.map((coupon) => (
        <Coupon key={coupon.id} coupon={coupon} />
      ))}
      <div ref={ref} />
    </div>
  );
}

export default CouponListWidget;
