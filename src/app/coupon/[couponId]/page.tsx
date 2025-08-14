"use client";
import { useParams } from "next/navigation";

import { Button } from "@/shared/ui";
import { CenteredView } from "@/shared/ui/CenteredView";

function CouponDetailPage() {
  const { couponId } = useParams<{ couponId: string }>();

  const { name, date, writer, isExpired, isUsed } = {
    name: "CU_모바일 금액권 1천원권",
    date: "2025.07.02",
    writer: "한별",
    isExpired: true,
    isUsed: true,
  };

  return (
    <CenteredView>
      <div className="relative aspect-square w-30 shrink-0">
        {!isExpired && (
          <div className="absolute h-full w-full bg-white/90">
            <div>유효 기간이 지난 쿠폰입니다</div>
          </div>
        )}
        <div className="h-full w-full bg-red-400"></div>
      </div>
      <div className="flex flex-col items-center gap-1.5 px-3">
        <div className="text-sm font-medium">{name}</div>
        <div className="text-xs">{writer}</div>
        <div className="text-dark text-xs">{date}</div>
      </div>
      <Button>사용하기</Button>
    </CenteredView>
  );
}

export default CouponDetailPage;
