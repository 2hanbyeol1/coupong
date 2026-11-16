"use client";

import { memo } from "react";
import Link from "next/link";

import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/util/cn";
import {
  formatDaysLeft,
  formatShortDate,
  getDaysLeft,
  getExpired,
} from "@/shared/lib/util/date";
import { Chip } from "@/shared/ui";

import { CouponType } from "../../api/type";
import { CouponImage } from "../CouponImage";

/** 남은 날이 이 이하면 빨갛게 강조 */
const URGENT_DAYS_LEFT = 7;

interface CouponProps {
  coupon: CouponType;
  /** 검색 결과에서 진입한 경우, 상세에서 검색 결과 안에서만 스와이프하도록 전달 */
  keyword?: string;
}

function Coupon({ coupon, keyword }: CouponProps) {
  const isExpired = getExpired(coupon.expire_at);
  const isUsed = !!coupon.used_by;
  const isInvalid = isExpired || isUsed;
  const daysLeft = getDaysLeft(coupon.expire_at);

  const getInvalidMessage = () => {
    if (isUsed) return "사용 완료";
    if (isExpired) return "기간 만료";
    return "";
  };

  return (
    <div className="relative">
      <Link
        href={ROUTES.COUPON_DETAIL(coupon.id.toString(), keyword)}
        className="flex items-center gap-3.5 py-1"
      >
        <div className="relative size-16 shrink-0 overflow-hidden rounded-lg ring-1 ring-black/5">
          {isInvalid && (
            <Chip
              color="white"
              className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
            >
              {getInvalidMessage()}
            </Chip>
          )}

          {/* 쿠폰 사진은 위쪽에 상품 사진이 있어 위를 기준으로 자름 */}
          <CouponImage
            couponName={coupon.name}
            imagePath={coupon.image_path}
            isInvalid={isInvalid}
            imageClassName="object-top"
            sizes="4rem"
          />
        </div>

        {/* 지난 쿠폰은 흐리게(opacity) 하면 글자가 읽히지 않아, 이름만 회색으로 낮춤 */}
        <div className="min-w-0 flex-1 pr-4">
          <div className="text-dark truncate text-xs font-medium">
            {coupon.place}
          </div>
          <div
            className={cn(
              "truncate text-[15px] font-semibold",
              isInvalid && "text-dark",
            )}
          >
            {coupon.name}
          </div>
          {/* 사용 가능: 남은 날만 (정확한 날짜는 상세에서) / 지난 쿠폰: 남은 날이 없으므로 날짜 */}
          <div className="mt-1 flex items-center">
            {isInvalid ? (
              <span className="text-dark text-xs">
                {formatShortDate(coupon.expire_at)}까지
              </span>
            ) : (
              <Chip
                color={daysLeft <= URGENT_DAYS_LEFT ? "danger" : "muted"}
                className="font-semibold"
              >
                {formatDaysLeft(daysLeft)}
              </Chip>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default memo(Coupon);
