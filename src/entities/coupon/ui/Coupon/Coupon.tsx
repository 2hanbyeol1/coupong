"use client";

import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/util/cn";
import { getExpired, getYYYYMMDD } from "@/shared/lib/util/date";

import { CouponType } from "../../api/type";
import { CouponImage } from "../CouponImage";

interface CouponProps {
  coupon: CouponType;
}

function Coupon({ coupon }: CouponProps) {
  const isExpired = getExpired(coupon.expire_at);
  const isUsed = !!coupon.used_by;
  const isInvalid = isExpired || isUsed;

  const getInvalidMessage = () => {
    if (isUsed) return "사용 완료";
    if (isExpired) return "기간 만료";
    return "";
  };

  return (
    <a
      href={ROUTES.COUPON_DETAIL(coupon.id.toString())}
      className="flex items-center gap-2"
    >
      <div className="relative aspect-square w-20 shrink-0">
        {isInvalid && (
          <span className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-xs bg-white px-2 py-1 text-xs font-medium whitespace-nowrap text-black">
            {getInvalidMessage()}
          </span>
        )}

        <CouponImage
          couponName={coupon.name}
          imagePath={coupon.image_path}
          isInvalid={isInvalid}
        />
      </div>

      <div
        className={cn(
          "flex flex-grow flex-col gap-1.5 px-3",
          isInvalid && "opacity-20",
        )}
      >
        <div className="text-sm font-medium">{coupon.name}</div>
        <div className="text-dark flex items-center justify-between gap-2 text-xs">
          {getYYYYMMDD(coupon.expire_at)}까지 사용
        </div>
      </div>
    </a>
  );
}

export default Coupon;
