import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";

import { getInfiniteUserGroupsOption } from "@/entities/user/api/query";
import { cn } from "@/shared/lib/util/cn";
import { InfoMessage } from "@/shared/ui/InfoMessage";
import Skeleton from "@/shared/ui/Skeleton";

interface MyGroupListWidgetProps {
  className?: string;
}

function MyGroupListWidget({ className }: MyGroupListWidgetProps) {
  const { ref, inView } = useInView();

  const {
    data: groups,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(getInfiniteUserGroupsOption());

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  if (isPending)
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <div className="text-xl font-medium">내 그룹</div>
        <div className="flex flex-col gap-2 px-3 pb-6">
          <Skeleton className="w-40" textSize="base" />
          <Skeleton className="w-40" textSize="base" />
          <Skeleton className="w-40" textSize="base" />
        </div>
      </div>
    );
  if (isError) return <div>에러</div>;

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="text-xl font-medium">내 그룹</div>
      {groups.length === 0 ? (
        <InfoMessage
          title="참여 중인 그룹이 없어요"
          description="초대를 받거나 새 그룹을 생성하세요"
        />
      ) : (
        <div className="flex flex-col gap-2 px-3 pb-6">
          {groups.map((group) => (
            <div key={group.organization_id}>{group.organizations.name}</div>
          ))}

          {isFetchingNextPage && <div>로딩</div>}
          {hasNextPage && !isFetchingNextPage && (
            <div ref={ref} className="h-4" />
          )}
        </div>
      )}
    </div>
  );
}

export default MyGroupListWidget;
