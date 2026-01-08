import { cn } from "@/shared/lib/util/cn";
import Skeleton from "@/shared/ui/Skeleton";

interface CouponDetailWidgetSkeletonProps {
  className?: string;
}

function CouponDetailWidgetSkeleton({
  className,
}: CouponDetailWidgetSkeletonProps) {
  return (
    <>
      <Skeleton className="h-full w-full" wrapper />
      <Skeleton
        className={cn(
          "flex w-full flex-col gap-5 bg-white px-4 pt-3 pb-7",
          className,
        )}
        wrapper
      >
        <div className="flex flex-col gap-6">
          {/* <div className="flex flex-col gap-1">
          <div className="flex flex-col gap-2">
            <Skeleton className="w-8" textSize="sm" />
            <Skeleton className="w-52" textSize="lg" />
          </div>
          <div className="flex justify-between gap-2">
            <Skeleton textSize="sm" className="w-36" />
            <Skeleton textSize="sm" className="w-8" />
          </div>
        </div> */}

          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </Skeleton>
    </>
  );
}

export default CouponDetailWidgetSkeleton;
