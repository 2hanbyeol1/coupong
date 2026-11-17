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
import { formatWon } from "@/shared/lib/util/money";
import { Chip } from "@/shared/ui";

import { CouponType } from "../../api/type";
import { getRemainingAmount, isAmountCoupon } from "../../lib/amount";
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
  const isAmount = isAmountCoupon(coupon);
  const remaining = getRemainingAmount(coupon);
  const isPartlyUsed =
    isAmount && remaining > 0 && remaining < (coupon.face_value ?? 0);

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
        <div className="ring-ink/5 relative size-16 shrink-0 overflow-hidden rounded-lg ring-1">
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
          {/* 금액권은 상세처럼 이름 뒤에 처음 금액 (이름이 길면 이름만 줄이고 금액은 항상 보임) */}
          <div
            className={cn(
              "flex min-w-0 items-baseline gap-1.5 text-[15px]",
              isInvalid && "text-dark",
            )}
          >
            <span className="truncate font-semibold">{coupon.name}</span>
            {isAmount && (
              <span
                className={cn(
                  "shrink-0 font-bold tabular-nums",
                  isInvalid && "font-semibold",
                )}
              >
                {formatWon(coupon.face_value ?? 0)}
              </span>
            )}
          </div>
          {/* 사용 가능: 남은 날만 (정확한 날짜는 상세에서) / 지난 쿠폰: 남은 날이 없으므로 날짜 */}
          <div className="mt-1 flex min-w-0 items-center gap-1.5">
            {isInvalid ? (
              <span className="text-dark shrink-0 text-xs">
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
            {/* 남은 금액은 상태라 남은 날 옆에, 쓰기 시작한 금액권만
                (안 쓴 건 이름 옆 금액과 같고, 다 쓴 건 사진 위 '사용 완료'로 충분) */}
            {/* 남은 날과 같은 모양 (지난 쿠폰은 날짜처럼 글자로) */}
            {isPartlyUsed &&
              (isInvalid ? (
                <span className="text-dark shrink-0 text-xs tabular-nums">
                  {formatWon(remaining)} 남음
                </span>
              ) : (
                <Chip color="muted" className="font-semibold">
                  {formatWon(remaining)} 남음
                </Chip>
              ))}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default memo(Coupon);
