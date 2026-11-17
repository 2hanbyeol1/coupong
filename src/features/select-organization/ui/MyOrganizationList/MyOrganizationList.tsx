"use client";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

import { getMyOrganizationIdsOption } from "@/entities/organization/api/query";
import { Organization } from "@/entities/organization/ui/Organization";
import OrganizationSkeleton from "@/entities/organization/ui/Organization/OrganizationSkeleton";
import { getInfiniteOrganizationsOption } from "@/entities/user/api/query";
import { cn } from "@/shared/lib/util/cn";
import { InfiniteScroll } from "@/shared/ui/InfiniteScroll";
import { InfoMessage } from "@/shared/ui/InfoMessage";
import Iterator from "@/shared/ui/Iterator/Iterator";

import AddOrganizationButton from "../../../add-organization/ui/AddOrganizationButton/AddOrganizationButton";
import { LeaveOrganizationButton } from "../../../leave-organization/ui/LeaveOrganizationButton";

const PAGE_SIZE = 10;

interface MyOrganizationListProps {
  className?: string;
  onSelect?: () => void;
}

function MyOrganizationList({ className, onSelect }: MyOrganizationListProps) {
  const {
    data: organizations,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(getInfiniteOrganizationsOption());
  const queryClient = useQueryClient();

  if (isPending) {
    // 이미 알고 있는 그룹 수만큼만 스켈레톤을 그려, 불러온 뒤 높이가 크게 바뀌지 않게 함
    const knownCount = queryClient.getQueryData(
      getMyOrganizationIdsOption().queryKey,
    )?.length;
    const skeletonCount = knownCount
      ? Math.min(knownCount, PAGE_SIZE)
      : PAGE_SIZE;

    return (
      <div className={cn("flex flex-col pb-6", className)}>
        <Iterator
          count={skeletonCount}
          render={(idx) => (
            <OrganizationSkeleton key={`organization-skeleton-${idx}`} />
          )}
        />
      </div>
    );
  }
  if (isError)
    return (
      <InfoMessage
        title="그룹을 불러오는 중 오류가 발생했습니다"
        description="잠시 후 다시 시도해 주세요"
      />
    );
  if (organizations.length === 0)
    return (
      <InfoMessage
        title="참여 중인 그룹이 없어요"
        description="새 그룹을 생성하거나 기존 그룹에 참여하세요"
      />
    );

  return (
    <InfiniteScroll
      className={cn("pb-6", className)}
      loader={
        <Iterator
          count={10}
          render={(idx) => (
            <OrganizationSkeleton key={`organization-skeleton-${idx}`} />
          )}
        />
      }
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
    >
      {organizations.map((org) => (
        <Organization
          key={org.id}
          organization={org}
          onSelect={onSelect}
          actions={<LeaveOrganizationButton organization={org} />}
        />
      ))}

      <div className="mt-4 flex justify-center">
        <AddOrganizationButton />
      </div>
    </InfiniteScroll>
  );
}

export default MyOrganizationList;
