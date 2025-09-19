import { ComponentProps } from "react";
import { useQuery } from "@tanstack/react-query";

import { getOrganizationByIdOption } from "@/entities/organization/api/query";
import { useOrganizationStore } from "@/entities/organization/model/store";
import Skeleton from "@/shared/ui/Skeleton";

function SelectedOrganization({ ...props }: ComponentProps<"div">) {
  const { selectedOrganizationId: selectedOrgId } = useOrganizationStore();

  const {
    data: organization,
    isPending,
    isError,
  } = useQuery({
    ...getOrganizationByIdOption(selectedOrgId ?? ""),
    enabled: !!selectedOrgId,
  });

  if (!selectedOrgId) return <div {...props}>그룹 선택</div>;
  if (isPending) return <Skeleton className="w-20" textSize="xl" />;
  if (isError) return <div>에러</div>;

  return <div {...props}>{organization.name}</div>;
}

export default SelectedOrganization;
