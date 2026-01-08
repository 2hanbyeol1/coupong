import { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { getOrganizationByIdOption } from "@/entities/organization/api/query";
import { useOrganizationStore } from "@/entities/organization/model/store";
import Skeleton from "@/shared/ui/Skeleton";

import { OrganizationType } from "../../api/type";

interface SelectedOrganizationProps {
  className?: string;
}

interface SuspensedSelectedOrganizationProps extends SelectedOrganizationProps {
  selectedOrganizationId: OrganizationType["id"];
}

function SelectedOrganization({ className }: SelectedOrganizationProps) {
  const { selectedOrganizationId, isHydrated } = useOrganizationStore();

  if (!isHydrated) return <Skeleton className="w-20" textSize="xl" />;
  if (!selectedOrganizationId)
    return <div className={className}>그룹 선택</div>;

  return (
    <Suspense fallback={<Skeleton className="w-20" textSize="xl" />}>
      <SuspensedSelectedOrganization
        className={className}
        selectedOrganizationId={selectedOrganizationId}
      />
    </Suspense>
  );
}

function SuspensedSelectedOrganization({
  className,
  selectedOrganizationId,
}: SuspensedSelectedOrganizationProps) {
  const { data: organization } = useSuspenseQuery({
    ...getOrganizationByIdOption(selectedOrganizationId),
  });

  if (!organization) return <div className={className}>그룹 선택</div>;

  return <div className={className}>{organization.name}</div>;
}

export default SelectedOrganization;
