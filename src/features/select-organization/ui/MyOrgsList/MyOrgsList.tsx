import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { Organization } from "@/entities/organization/ui/Organization";
import OrganizationSkeleton from "@/entities/organization/ui/Organization/OrganizationSkeleton";
import { getInfiniteOrganizationsOption } from "@/entities/user/api/query";
import AddOrganizationForm from "@/features/add-organization/ui/AddOrganizationForm/AddOrganizationForm";
import useModal from "@/shared/lib/hook/useModal";
import { cn } from "@/shared/lib/util/cn";
import { InfoMessage } from "@/shared/ui/InfoMessage";

interface MyOrgsListProps {
  className?: string;
  onSelect?: () => void;
}

function MyOrgsList({ className, onSelect }: MyOrgsListProps) {
  const { ref, inView } = useInView();
  const { showModal } = useModal();

  const openAddOrganizationModal = () => {
    showModal({
      title: "새 그룹 만들기",
      content: <AddOrganizationForm formId="add-organization" />,
      confirmButtonText: "등록",
      formId: "add-organization",
    });
  };

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

  if (organizations.length === 0)
    return (
      <InfoMessage
        title="참여 중인 그룹이 없어요"
        description="새 그룹을 생성하거나 기존 그룹에 참여하세요"
      />
    );

  return (
    <div className={cn("flex flex-col pb-6", className)}>
      {organizations.map((org) => (
        <Organization key={org.id} organization={org} onSelect={onSelect} />
      ))}

      {isFetchingNextPage && <OrganizationSkeleton count={10} />}
      {hasNextPage && !isFetchingNextPage && <div ref={ref} className="h-4" />}

      <div className="mt-4 flex justify-center">
        <button
          type="button"
          className="flex items-center gap-1"
          onClick={openAddOrganizationModal}
        >
          <Plus className="stroke-primary stroke-3" size={14} />
          <span className="text-primary text-sm font-medium">
            새 그룹 만들기
          </span>
        </button>
      </div>
    </div>
  );
}

export default MyOrgsList;
