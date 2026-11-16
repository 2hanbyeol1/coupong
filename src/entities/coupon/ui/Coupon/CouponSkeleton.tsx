import Skeleton from "@/shared/ui/Skeleton";

function CouponSkeleton() {
  return (
    <Skeleton className="flex items-center gap-3.5 py-1" wrapper>
      <Skeleton className="size-16 shrink-0 rounded-lg" />

      <div className="flex flex-grow flex-col">
        <Skeleton className="w-16" textSize="xs" />
        <Skeleton className="w-40" textSize="base" />
        <Skeleton className="mt-1 w-24" textSize="xs" />
      </div>
    </Skeleton>
  );
}

export default CouponSkeleton;
