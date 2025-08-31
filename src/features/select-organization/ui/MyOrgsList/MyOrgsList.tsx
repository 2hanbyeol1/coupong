import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";

import { OrganizationType } from "@/entities/organization/api/type";
import { useOrganizationStore } from "@/entities/organization/model/store";
import { Organization } from "@/entities/organization/ui/Organization";
import OrganizationSkeleton from "@/entities/organization/ui/Organization/OrganizationSkeleton";
import { getInfiniteOrganizationsOption } from "@/entities/user/api/query";
import { AddOrgButton } from "@/features/add-organization/ui";
import { cn } from "@/shared/lib/util/cn";
import { InfoMessage } from "@/shared/ui/InfoMessage";

interface MyOrgsListProps {
  className?: string;
  onSelect?: () => void;
}

function MyOrgsList({ className, onSelect }: MyOrgsListProps) {
  const { ref, inView } = useInView();
  const { setSelectedOrgId } = useOrganizationStore();

  const {
    data: organizations,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(getInfiniteOrganizationsOption());

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  if (isPending)
    return (
      <div className={cn("flex flex-col pb-6", className)}>
        <OrganizationSkeleton count={10} />
      </div>
    );
  if (isError) return <div>에러</div>;

  const handleSelectOrg = (orgId: OrganizationType["id"]) => {
    setSelectedOrgId(orgId);
    onSelect?.();
  };

  if (organizations.length === 0)
    return (
      <InfoMessage
        title="참여 중인 그룹이 없어요"
        description="문의 주세요 (기능 구현 중)"
        // ! description="초대를 받거나 새 그룹을 생성하세요"
      />
    );

  return (
    <div className={cn("flex flex-col pb-6", className)}>
      {organizations.map((org) => (
        <button
          key={org.id}
          className="cursor-pointer"
          onClick={() => handleSelectOrg(org.id)}
        >
          <Organization {...org} />
        </button>
      ))}

      {isFetchingNextPage && <OrganizationSkeleton count={10} />}
      {hasNextPage && !isFetchingNextPage && <div ref={ref} className="h-4" />}

      <AddOrgButton className="mt-3 self-center" />
    </div>
  );
}

export default MyOrgsList;
