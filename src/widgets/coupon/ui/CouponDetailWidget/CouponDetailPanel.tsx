"use client";
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ReceiptText } from "lucide-react";

import { getCouponDetailOption } from "@/entities/coupon/api/query";
import { CouponType } from "@/entities/coupon/api/type";
import {
  getRemainingAmount,
  isAmountCoupon,
} from "@/entities/coupon/lib/amount";
import { Avatar } from "@/entities/user/ui/Avatar";
import { CouponMenu } from "@/features/manage-coupon/ui/CouponMenu";
import { CouponUsageHistory } from "@/features/use-coupon/ui/CouponUsageHistory";
import {
  AmountCouponUsage,
  UseAmountCouponButton,
} from "@/features/use-coupon/ui/UseAmountCouponButton";
import { UseCouponButton } from "@/features/use-coupon/ui/UseCouponButton";
import { getCouponStatus } from "@/shared/lib/util/coupon";
import { getYYYYMMDD } from "@/shared/lib/util/date";
import { formatWon } from "@/shared/lib/util/money";
import { BottomSheet, Button, Chip } from "@/shared/ui";

interface CouponDetailPanelProps {
  couponId: CouponType["id"];
  /** 금액권이면 usage에 쓴 금액·남은 금액이 담겨 옴 */
  onUsed: (usage?: AmountCouponUsage) => void;
  onDeleted: () => void;
}

function CouponDetailPanel({
  couponId,
  onUsed,
  onDeleted,
}: CouponDetailPanelProps) {
  const [isCouponInfoOpen, setIsCouponInfoOpen] = useState(false);
  const { data: coupon } = useSuspenseQuery(getCouponDetailOption(couponId));

  if (!coupon) return null;

  const { isExpired, isUsed, isInvalid } = getCouponStatus(coupon);
  const isAmount = isAmountCoupon(coupon);
  const remaining = getRemainingAmount(coupon);

  const openCouponInfo = () => setIsCouponInfoOpen(true);
  const closeCouponInfo = () => setIsCouponInfoOpen(false);

  const getInvalidMessage = () => {
    if (isUsed)
      return isAmount
        ? `${coupon.use_username?.name}님이 남은 금액을 모두 사용했어요`
        : `${coupon.use_username?.name}님이 이미 사용한 쿠폰이예요`;
    if (isExpired)
      return isAmount
        ? `${formatWon(remaining)}을 남기고 기간이 지났어요`
        : "기간이 지나 사용할 수 없는 쿠폰이예요";
    return "";
  };

  return (
    <div className="bg-surface flex w-full flex-col gap-5 px-4 pt-3 pb-7">
      <div className="flex flex-col">
        {isInvalid ? (
          // 사용 가능한 쿠폰의 버튼 영역(h-12)과 높이를 맞춰 레이아웃이 흔들리지 않게 해요
          <div className="relative flex h-12 items-center justify-center">
            {/* 다 쓴 금액권도 사용 내역을 보고, 내 기록을 지워 되살릴 수 있게 함 */}
            {isAmount && (
              <button
                type="button"
                onClick={openCouponInfo}
                aria-label="쿠폰 정보와 사용 내역 보기"
                className="text-dark absolute top-1/2 left-0 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full"
              >
                <ReceiptText size={20} />
              </button>
            )}
            <CouponMenu
              coupon={coupon}
              className="absolute top-1/2 right-0 -translate-y-1/2"
              onDeleted={onDeleted}
            />
            <div className="text-dark px-10 text-center text-sm break-keep">
              {getInvalidMessage()}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button
              color="light"
              size="lg"
              onClick={openCouponInfo}
              // 금액권은 남은 금액을 바로 보여주고, 누르면 쿠폰 정보·사용 내역이 열림
              aria-label={
                isAmount
                  ? `쿠폰 정보 (남은 금액 ${formatWon(remaining)})`
                  : undefined
              }
            >
              {isAmount ? (
                <span className="tabular-nums">
                  잔액 {formatWon(remaining)}
                </span>
              ) : (
                "쿠폰 정보"
              )}
            </Button>
            {isAmount ? (
              <UseAmountCouponButton coupon={coupon} onUsed={onUsed} />
            ) : (
              <UseCouponButton couponId={coupon.id} onUsed={() => onUsed()} />
            )}
          </div>
        )}
      </div>

      <BottomSheet
        open={isCouponInfoOpen}
        onClose={closeCouponInfo}
        title="쿠폰 정보"
        headerAction={<CouponMenu coupon={coupon} onDeleted={onDeleted} />}
      >
        <div className="flex flex-col gap-5 pb-2">
          {/* 무슨 쿠폰인지: 사용처 → 이름(금액권은 처음 금액까지 한 제목으로) */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="text-dark text-sm">{coupon.place}</span>
              {isAmount && <Chip color="accent">금액권</Chip>}
            </div>
            <h3 className="text-lg font-semibold break-keep">
              {coupon.name}
              {/* 남은 금액은 사용 내역 맨 아래 */}
              {isAmount && (
                <span className="ml-1.5 whitespace-nowrap tabular-nums">
                  {formatWon(coupon.face_value ?? 0)}
                </span>
              )}
            </h3>
          </div>

          {/* 등록한 사람은 왼쪽, 유효 기간은 오른쪽 끝 */}
          <div className="flex items-center justify-between gap-3 text-sm">
            <div className="flex min-w-0 items-center gap-1.5">
              <Avatar userId={coupon.uploaded_by} size={24} />
              <span className="truncate">{coupon.upload_username.name}</span>
            </div>
            <div className="shrink-0 tabular-nums">
              {getYYYYMMDD(coupon.expire_at)}까지
            </div>
          </div>

          {isAmount && (
            <>
              {/* 쿠폰 정보와 사용 내역을 굵은 띠로 나눔 (시트 양옆까지) */}
              <div aria-hidden className="bg-light -mx-5 h-2 shrink-0" />
              <CouponUsageHistory couponId={coupon.id} remaining={remaining} />
            </>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}

export default CouponDetailPanel;
