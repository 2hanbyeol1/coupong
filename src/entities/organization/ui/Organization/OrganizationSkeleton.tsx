import Skeleton from "@/shared/ui/Skeleton";

interface OrganizationSkeletonProps {
  count?: number;
}

function OrganizationSkeleton({ count = 1 }: OrganizationSkeletonProps) {
  return Array.from({ length: count }).map((_, idx) => (
    <div
      key={`organization-skeleton-${idx}`}
      className="flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-5 rounded-full" />
        <div className="py-2">
          <Skeleton className="w-20" textSize="base" />
        </div>
      </div>
    </div>
  ));
}

export default OrganizationSkeleton;
