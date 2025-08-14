import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/util/cn";
import { getExpired } from "@/shared/lib/util/date";

interface CouponProps {
  id: string;
  name: string;
  date: string;
  isUsed: boolean;
}

function Coupon({ id, name, date, isUsed }: CouponProps) {
  const isExpired = getExpired(date);
  const isInvalid = isExpired || isUsed;

  return (
    <a
      href={ROUTES.COUPON_DETAIL(id)}
      className={cn(
        "flex items-center gap-2",
        isInvalid ? "cursor-not-allowed opacity-30" : "",
      )}
    >
      <div
        className={cn(
          "relative aspect-square w-20 shrink-0",
          isInvalid ? "bg-white/90" : "",
        )}
      >
        {isUsed ? (
          <div className="absolute top-0 left-0">사용 완료</div>
        ) : isExpired ? (
          <div className="absolute top-0 left-0">유효 기간 만료</div>
        ) : (
          <></>
        )}
        <div className="h-full w-full bg-red-400"></div>
      </div>
      <div className="flex flex-grow flex-col gap-1.5 px-3">
        <div className="text-sm font-medium">{name}</div>
        <div className="text-dark text-xs">{date}</div>
      </div>
    </a>
  );
}

export default Coupon;
