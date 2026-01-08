import Skeleton from "@/shared/ui/Skeleton";

function OrganizationSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-5 rounded-full" />
        <div className="py-2">
          <Skeleton className="w-20" textSize="base" />
        </div>
      </div>
    </div>
  );
}

export default OrganizationSkeleton;
