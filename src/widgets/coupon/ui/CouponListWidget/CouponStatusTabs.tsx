"use client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

import { CouponListFilter } from "@/entities/coupon/api/api";
import { getCouponCountOption } from "@/entities/coupon/api/query";
import {
  COUPON_LIST_STATUS_LABEL,
  COUPON_LIST_STATUSES,
  CouponListStatus,
} from "@/entities/coupon/lib/status";
import { cn } from "@/shared/lib/util/cn";

interface CouponStatusTabsProps {
  filter: Omit<CouponListFilter, "status">;
  value: CouponListStatus;
  onChange: (status: CouponListStatus) => void;
  /** 스크롤해도 헤더(h-12) 바로 아래에 고정 */
  sticky?: boolean;
}

/** 사용 가능 / 지난 쿠폰 밑줄 탭 (탭마다 쿠폰 개수 표시) */
function CouponStatusTabs({
  filter,
  value,
  onChange,
  sticky,
}: CouponStatusTabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "mb-2 flex gap-5 border-b border-black/5 bg-white px-4",
        sticky && "sticky top-12 z-40",
      )}
    >
      {COUPON_LIST_STATUSES.map((status) => (
        <StatusTab
          key={status}
          filter={{ ...filter, status }}
          isSelected={status === value}
          onSelect={() => onChange(status)}
        />
      ))}
    </div>
  );
}

interface StatusTabProps {
  filter: CouponListFilter;
  isSelected: boolean;
  onSelect: () => void;
}

function StatusTab({ filter, isSelected, onSelect }: StatusTabProps) {
  const { data: count } = useQuery({
    ...getCouponCountOption(filter),
    // 개수를 못 불러와도 목록은 볼 수 있으므로 화면 전체를 에러로 바꾸지 않음
    throwOnError: false,
  });

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      onClick={onSelect}
      className={cn(
        "relative flex cursor-pointer items-center gap-1 pt-1 pb-2.5 text-[15px] transition-colors duration-200",
        isSelected ? "font-semibold text-black" : "font-medium text-black/35",
      )}
    >
      {COUPON_LIST_STATUS_LABEL[filter.status]}
      {count !== undefined && (
        <span
          className={cn(
            "font-medium tabular-nums",
            isSelected && "text-black/40",
          )}
        >
          {count}
        </span>
      )}
      {/* 밑줄이 탭 사이를 미끄러지듯 옮겨 감 */}
      {isSelected && (
        <motion.span
          layoutId="coupon-status-tab"
          className="absolute inset-x-0 -bottom-px h-0.5 bg-black"
          transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
        />
      )}
    </button>
  );
}

export default CouponStatusTabs;
