"use client";
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { getCouponDetailOption } from "@/entities/coupon/api/query";
import { CouponType } from "@/entities/coupon/api/type";
import {
  getRemainingAmount,
  isAmountCoupon,
} from "@/entities/coupon/lib/amount";
import { Avatar } from "@/entities/user/ui/Avatar";
import { CouponMenu } from "@/features/manage-coupon/ui/CouponMenu";
import { CouponUsageHistory } from "@/features/use-coupon/ui/CouponUsageHistory";
import { CouponUsedBy } from "@/features/use-coupon/ui/CouponUsedBy";
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

  const { isUsed, isInvalid } = getCouponStatus(coupon);
  const isAmount = isAmountCoupon(coupon);
  const remaining = getRemainingAmount(coupon);
  // 다 쓴 금액권은 잔액 대신 '쿠폰 정보'
  const hasRemaining = isAmount && remaining > 0;

  const openCouponInfo = () => setIsCouponInfoOpen(true);
  const closeCouponInfo = () => setIsCouponInfoOpen(false);

  return (
    <div className="bg-surface flex w-full flex-col gap-5 px-4 pt-3 pb-7">
      <div className="flex flex-col">
        <div className="grid grid-cols-2 gap-2">
          <Button
            color="light"
            size="lg"
            onClick={openCouponInfo}
            // 금액권은 남은 금액을 바로 보여주고, 누르면 쿠폰 정보·사용 내역이 열림
            aria-label={
              hasRemaining
                ? `쿠폰 정보 (남은 금액 ${formatWon(remaining)})`
                : undefined
            }
          >
            {hasRemaining ? (
              <span className="tabular-nums">잔액 {formatWon(remaining)}</span>
            ) : (
              "쿠폰 정보"
            )}
          </Button>
          {isInvalid ? (
            // 쓸 수 없는 쿠폰도 같은 자리에 왜 못 쓰는지 (쿠폰 정보는 왼쪽 버튼으로 계속 볼 수 있음)
            <Button size="lg" disabled>
              {isUsed ? "사용 완료" : "기한 지남"}
            </Button>
          ) : isAmount ? (
            <UseAmountCouponButton coupon={coupon} onUsed={onUsed} />
          ) : (
            <UseCouponButton couponId={coupon.id} onUsed={() => onUsed()} />
          )}
        </div>
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

          {/* 다 쓴 교환권은 금액권의 사용 내역과 같은 모양으로 누가 썼는지 */}
          {isUsed && !isAmount && coupon.used_by && (
            <>
              <div aria-hidden className="bg-light -mx-5 h-2 shrink-0" />
              <CouponUsedBy
                couponId={coupon.id}
                usedBy={coupon.used_by}
                userName={coupon.use_username?.name}
              />
            </>
          )}

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
