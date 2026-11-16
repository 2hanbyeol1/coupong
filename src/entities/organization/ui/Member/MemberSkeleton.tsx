import Skeleton from "@/shared/ui/Skeleton";

function MemberSkeleton() {
  return (
    <div className="flex items-center gap-3 py-2">
      <Skeleton className="h-7 w-7 rounded-full" />
      <Skeleton className="w-20" textSize="base" />
    </div>
  );
}

export default MemberSkeleton;
