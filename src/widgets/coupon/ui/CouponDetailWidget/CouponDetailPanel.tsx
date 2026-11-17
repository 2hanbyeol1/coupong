"use client";
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { getCouponDetailOption } from "@/entities/coupon/api/query";
import { CouponType } from "@/entities/coupon/api/type";
import { Avatar } from "@/entities/user/ui/Avatar";
import { CouponMenu } from "@/features/manage-coupon/ui/CouponMenu";
import { UseCouponButton } from "@/features/use-coupon/ui/UseCouponButton";
import { getCouponStatus } from "@/shared/lib/util/coupon";
import { getYYYYMMDD } from "@/shared/lib/util/date";
import { BottomSheet, Button } from "@/shared/ui";

interface CouponDetailPanelProps {
  couponId: CouponType["id"];
  onUsed: () => void;
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

  const openCouponInfo = () => setIsCouponInfoOpen(true);
  const closeCouponInfo = () => setIsCouponInfoOpen(false);

  const getInvalidMessage = () => {
    if (isUsed)
      return `${coupon.use_username?.name}님이 이미 사용한 쿠폰이예요`;
    if (isExpired) return "기간이 지나 사용할 수 없는 쿠폰이예요";
    return "";
  };

  return (
    <div className="bg-surface flex w-full flex-col gap-5 px-4 pt-3 pb-7">
      <div className="flex flex-col">
        {isInvalid ? (
          // 사용 가능한 쿠폰의 버튼 영역(h-12)과 높이를 맞춰 레이아웃이 흔들리지 않게 해요
          <div className="relative flex h-12 items-center justify-center">
            <CouponMenu
              coupon={coupon}
              className="absolute top-1/2 right-0 -translate-y-1/2"
              onDeleted={onDeleted}
            />
            <div className="text-dark px-8 text-center text-sm">
              {getInvalidMessage()}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button color="light" size="lg" onClick={openCouponInfo}>
              쿠폰 정보
            </Button>
            <UseCouponButton couponId={coupon.id} onUsed={onUsed} />
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
          <div className="flex flex-col gap-1">
            <div className="text-dark text-sm">{coupon.place}</div>
            <div className="text-lg font-medium break-keep">{coupon.name}</div>
          </div>
          <div className="flex items-center justify-between gap-2 text-sm">
            <div className="flex items-center gap-1.5">
              <Avatar userId={coupon.uploaded_by} size={24} />
              {coupon.upload_username.name}
            </div>
            <div>{getYYYYMMDD(coupon.expire_at)}까지</div>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}

export default CouponDetailPanel;
