"use client";
import { Suspense } from "react";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

import { CouponListFilter } from "@/entities/coupon/api/api";
import { getInfiniteCouponsOption } from "@/entities/coupon/api/query";
import { CouponListStatus } from "@/entities/coupon/lib/status";
import { Coupon } from "@/entities/coupon/ui/Coupon";
import CouponSkeleton from "@/entities/coupon/ui/Coupon/CouponSkeleton";
import { useOrganizationStore } from "@/entities/organization/model/store";
import { CouponContextMenu } from "@/features/manage-coupon/ui/CouponMenu";
import { InfiniteScroll } from "@/shared/ui/InfiniteScroll";
import { InfoMessage } from "@/shared/ui/InfoMessage";
import Iterator from "@/shared/ui/Iterator/Iterator";

import CouponListWidgetSkeleton from "./CouponListWidgetSkeleton";
import CouponStatusTabs from "./CouponStatusTabs";
import useCouponListStatusParam from "./useCouponListStatusParam";

interface CouponListWidgetProps {
  /** 사용처·이름에 이 키워드가 포함된 쿠폰만 (서버에서 검색) */
  keyword?: string;
  /** 스크롤해도 탭을 헤더 아래에 고정 (긴 목록에서도 바로 탭을 바꿀 수 있게) */
  stickyTabs?: boolean;
}

/** 사용 가능 / 지난 쿠폰 탭과 쿠폰 목록 */
function CouponListWidget({ keyword, stickyTabs }: CouponListWidgetProps) {
  const { selectedOrganizationId, isHydrated } = useOrganizationStore();
  const [status, setStatus] = useCouponListStatusParam();

  if (!isHydrated) return <CouponListWidgetSkeleton />;

  if (!selectedOrganizationId)
    return (
      <InfoMessage
        title="그룹을 선택해 주세요"
        description="쿠폰을 확인하려면 그룹을 선택해 주세요"
      />
    );

  const filter = { organizationId: selectedOrganizationId, keyword };

  // 고정된 탭으로 목록 중간에서 탭을 바꿔도 새 목록을 처음부터 보도록 맨 위로
  const handleStatusChange = (nextStatus: CouponListStatus) => {
    setStatus(nextStatus);
    if (stickyTabs) window.scrollTo({ top: 0 });
  };

  return (
    <>
      <CouponStatusTabs
        filter={filter}
        value={status}
        onChange={handleStatusChange}
        sticky={stickyTabs}
      />
      <Suspense fallback={<CouponListWidgetSkeleton />}>
        <SuspensedCouponList filter={{ ...filter, status }} />
      </Suspense>
    </>
  );
}

const EMPTY_MESSAGE: Record<
  CouponListStatus,
  { title: string; description: string }
> = {
  available: {
    title: "사용할 수 있는 쿠폰이 없어요",
    description: "화면 하단의 버튼을 눌러 등록해보세요",
  },
  past: {
    title: "지난 쿠폰이 없어요",
    description: "사용했거나 기간이 지난 쿠폰이 여기에 모여요",
  },
};

function SuspensedCouponList({ filter }: { filter: CouponListFilter }) {
  const { keyword } = filter;
  const {
    data: coupons,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSuspenseInfiniteQuery(getInfiniteCouponsOption(filter));

  if (isError)
    return (
      <InfoMessage
        title="쿠폰을 불러오는 중 오류가 발생했습니다"
        description="잠시 후 다시 시도해 주세요"
      />
    );

  if (!!keyword && coupons.length === 0)
    return (
      <InfoMessage
        title="검색된 쿠폰이 없어요"
        description="다른 키워드로 검색해보세요"
      />
    );

  if (coupons.length === 0)
    return <InfoMessage {...EMPTY_MESSAGE[filter.status]} />;

  return (
    <InfiniteScroll
      className="gap-2 px-3 pt-1 pb-6"
      loader={
        <Iterator
          count={10}
          render={(idx) => <CouponSkeleton key={`coupon-skeleton-${idx}`} />}
        />
      }
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
    >
      {coupons.map((coupon) => (
        // 우클릭하거나 길게 누르면 수정·삭제 메뉴
        <CouponContextMenu key={coupon.id} coupon={coupon}>
          <Coupon coupon={coupon} keyword={keyword} />
        </CouponContextMenu>
      ))}
    </InfiniteScroll>
  );
}

export default CouponListWidget;
