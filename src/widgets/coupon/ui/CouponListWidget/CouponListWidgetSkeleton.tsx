import CouponSkeleton from "@/entities/coupon/ui/Coupon/CouponSkeleton";
import Iterator from "@/shared/ui/Iterator/Iterator";

function CouponListWidgetSkeleton() {
  return (
    <div className="flex flex-col gap-2 px-3 pt-1 pb-6">
      <Iterator
        count={10}
        render={(idx) => <CouponSkeleton key={`coupon-skeleton-${idx}`} />}
      />
    </div>
  );
}

export default CouponListWidgetSkeleton;
