"use client";
import { CouponType } from "@/entities/coupon/api/type";
import { MoreMenu } from "@/shared/ui";

import useCouponMenuItems from "./useCouponMenuItems";

export interface CouponMenuProps {
  coupon: CouponType;
  className?: string;
  onDeleted?: () => void;
}

/** 쿠폰 수정·삭제 더보기 버튼 (권한이 없으면 보이지 않음) */
function CouponMenu({ coupon, className, onDeleted }: CouponMenuProps) {
  const items = useCouponMenuItems(coupon, { onDeleted });
  if (!items) return null;

  return <MoreMenu className={className} items={items} />;
}

export default CouponMenu;
