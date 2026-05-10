"use client";
import { AlertCircle } from "lucide-react";
import Image from "next/image";

import { COUPON_IMAGE_ASPECT_CLASS } from "@/entities/coupon/constants";
import { cn } from "@/shared/lib/util/cn";
import { BottomSheet } from "@/shared/ui";

interface CouponListBottomSheetProps {
  open: boolean;
  imagePreviews: string[];
  currentIndex: number;
  incompleteCoupons: boolean[];
  onSelect: (index: number) => void;
  onClose: () => void;
}

function CouponListBottomSheet({
  open,
  imagePreviews,
  currentIndex,
  incompleteCoupons,
  onSelect,
  onClose,
}: CouponListBottomSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title="쿠폰 목록">
      <div className="grid grid-cols-3 gap-2 pb-2">
        {imagePreviews.map((url, index) => {
          const isIncomplete = incompleteCoupons[index];
          return (
            <button
              key={url}
              type="button"
              onClick={() => onSelect(index)}
              aria-label={`쿠폰 ${index + 1} 선택${isIncomplete ? " (미완료)" : ""}`}
              aria-current={index === currentIndex ? "true" : undefined}
              className={cn(
                "relative cursor-pointer overflow-hidden rounded-md border-2",
                COUPON_IMAGE_ASPECT_CLASS,
                index === currentIndex
                  ? "border-primary"
                  : "border-light hover:border-dark/40",
              )}
            >
              <Image
                src={url}
                alt={`쿠폰 이미지 ${index + 1}`}
                fill
                className="object-contain"
              />
              <span
                className={cn(
                  "absolute top-1 left-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs",
                  index === currentIndex
                    ? "bg-primary text-white"
                    : "bg-black/50 text-white",
                )}
              >
                {index + 1}
              </span>
              {isIncomplete && (
                <span
                  aria-hidden="true"
                  className="text-error absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow"
                >
                  <AlertCircle size={14} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}

export default CouponListBottomSheet;
