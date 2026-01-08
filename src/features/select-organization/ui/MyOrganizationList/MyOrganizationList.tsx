"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { Organization } from "@/entities/organization/ui/Organization";
import OrganizationSkeleton from "@/entities/organization/ui/Organization/OrganizationSkeleton";
import { getInfiniteOrganizationsOption } from "@/entities/user/api/query";
import { cn } from "@/shared/lib/util/cn";
import { InfiniteScroll } from "@/shared/ui/InfiniteScroll";
import { InfoMessage } from "@/shared/ui/InfoMessage";
import Iterator from "@/shared/ui/Iterator/Iterator";

import AddOrganizationButton from "../../../add-organization/ui/AddOrganizationButton/AddOrganizationButton";

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
    isFetchingNextPage,
  } = useInfiniteQuery(getInfiniteOrganizationsOption());

  if (isPending)
    return (
      <div className={cn("flex flex-col pb-6", className)}>
        <Iterator
          count={10}
          render={(idx) => (
            <OrganizationSkeleton key={`organization-skeleton-${idx}`} />
          )}
        />
      </div>
    );
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
      isFetchingNextPage={isFetchingNextPage}
    >
      {organizations.map((org) => (
        <Organization key={org.id} organization={org} onSelect={onSelect} />
      ))}

      <div className="mt-4 flex justify-center">
        <AddOrganizationButton />
      </div>
    </InfiniteScroll>
  );
}

export default MyOrganizationList;
