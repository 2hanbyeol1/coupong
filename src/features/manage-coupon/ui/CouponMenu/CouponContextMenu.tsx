"use client";
import { ReactNode } from "react";

import { CouponType } from "@/entities/coupon/api/type";
import { ContextMenu } from "@/shared/ui";

import useCouponMenuItems from "./useCouponMenuItems";

export interface CouponContextMenuProps {
  coupon: CouponType;
  children: ReactNode;
  className?: string;
}

/** 우클릭하거나 길게 누르면 쿠폰 수정·삭제 메뉴 (권한이 없으면 기본 동작 그대로) */
function CouponContextMenu({
  coupon,
  children,
  className,
}: CouponContextMenuProps) {
  const items = useCouponMenuItems(coupon);

  return (
    <ContextMenu items={items ?? []} disabled={!items} className={className}>
      {children}
    </ContextMenu>
  );
}

export default CouponContextMenu;
