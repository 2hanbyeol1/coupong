import { useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  CouponListStatus,
  DEFAULT_COUPON_LIST_STATUS,
  isCouponListStatus,
} from "@/entities/coupon/lib/status";
import { replaceSearchParams } from "@/shared/lib/util/url";

const STATUS_PARAM = "status";

/**
 * 쿠폰 목록 탭을 URL(?status=past)에 저장
 * 쿠폰 상세에 들어갔다 뒤로 돌아와도 보던 탭이 유지됨
 */
function useCouponListStatusParam() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<CouponListStatus>(() => {
    const value = searchParams.get(STATUS_PARAM);
    return isCouponListStatus(value) ? value : DEFAULT_COUPON_LIST_STATUS;
  });

  const changeStatus = (nextStatus: CouponListStatus) => {
    setStatus(nextStatus);
    replaceSearchParams({
      [STATUS_PARAM]:
        nextStatus === DEFAULT_COUPON_LIST_STATUS ? undefined : nextStatus,
    });
  };

  return [status, changeStatus] as const;
}

export default useCouponListStatusParam;
