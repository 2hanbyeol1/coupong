import { useEffect, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { getInfiniteCouponsOption } from "@/entities/coupon/api/query";
import { CouponType } from "@/entities/coupon/api/type";
import { filterCouponsByKeyword } from "@/entities/coupon/lib/filter";

// 현재 쿠폰 뒤에 남은 쿠폰이 이 개수 이하가 되면 다음 페이지를 미리 불러온다.
const PREFETCH_THRESHOLD = 2;

interface UseCouponSequenceParams {
  organizationId: CouponType["organization_id"];
  currentId: CouponType["id"];
  keyword?: string;
  excludedIds: CouponType["id"][];
}

/**
 * 쿠폰 목록(홈/검색과 같은 순서) 안에서 현재 쿠폰의 이전/다음 쿠폰을 찾는다.
 * 현재 쿠폰이 아직 불러온 페이지에 없으면(새로고침/공유 링크로 직접 진입) 찾을 때까지 다음 페이지를 불러온다.
 */
function useCouponSequence({
  organizationId,
  currentId,
  keyword,
  excludedIds,
}: UseCouponSequenceParams) {
  const {
    data: coupons,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
  } = useInfiniteQuery({
    ...getInfiniteCouponsOption(organizationId ?? ""),
    enabled: !!organizationId,
  });

  const sequence = useMemo(
    () =>
      filterCouponsByKeyword(coupons ?? [], keyword).filter(
        (coupon) => !excludedIds.includes(coupon.id),
      ),
    [coupons, keyword, excludedIds],
  );

  const index = sequence.findIndex((coupon) => coupon.id === currentId);
  const isFound = index !== -1;

  const shouldFetchNextPage =
    hasNextPage &&
    !isFetchingNextPage &&
    !isFetchNextPageError &&
    (!isFound || index >= sequence.length - 1 - PREFETCH_THRESHOLD);

  useEffect(() => {
    if (shouldFetchNextPage) fetchNextPage();
  }, [shouldFetchNextPage, fetchNextPage]);

  return {
    current: isFound ? sequence[index] : undefined,
    prev: isFound ? sequence[index - 1] : undefined,
    next: isFound ? sequence[index + 1] : undefined,
  };
}

export default useCouponSequence;
