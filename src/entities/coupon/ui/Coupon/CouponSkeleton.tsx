import Skeleton from "@/shared/ui/Skeleton";

interface CouponSkeletonProps {
  count?: number;
}

function CouponSkeleton({ count = 1 }: CouponSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <Skeleton
          key={`skeleton-${idx}`}
          className="flex items-center gap-2"
          wrapper
        >
          <Skeleton className="aspect-square w-20 shrink-0" />

          <div className="flex flex-grow flex-col gap-1.5 px-3">
            <Skeleton className="w-20" textSize="sm" />
            <Skeleton
              className="text-dark flex w-40 items-center justify-between gap-2"
              textSize="xs"
            />
          </div>
        </Skeleton>
      ))}
    </>
  );
}

export default CouponSkeleton;
