import { Check, Users } from "lucide-react";
import Link from "next/link";

import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/util/cn";

import { OrganizationType } from "../../api/type";
import { useOrganizationStore } from "../../model/store";

interface OrganizationProps {
  organization: OrganizationType;
  onSelect?: () => void;
}

function Organization({ organization, onSelect }: OrganizationProps) {
  const {
    selectedOrganizationId: selectedOrgId,
    setSelectedOrganizationId: setSelectedOrgId,
  } = useOrganizationStore();
  const isSelectedOrganization = organization.id === selectedOrgId;

  const handleSelectOrganization = (orgId: OrganizationType["id"]) => {
    setSelectedOrgId(orgId);
    onSelect?.();
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <button
        className="flex cursor-pointer items-center gap-3 pr-4"
        onClick={() => handleSelectOrganization(organization.id)}
      >
        {isSelectedOrganization ? (
          <div className="bg-primary flex h-5 w-5 items-center justify-center rounded-full">
            <Check className="stroke-light stroke-4" size={12} />
          </div>
        ) : (
          <div className="bg-light flex h-5 w-5 items-center justify-center rounded-full"></div>
        )}
        <div
          className={cn(
            "py-2 font-medium",
            isSelectedOrganization && "text-primary font-semibold",
          )}
        >
          {organization.name}
        </div>
      </button>
      {isSelectedOrganization && (
        <div className="flex items-center gap-3">
          {/* // ! */}
          {/* <LogOut className="stroke-dark" size={20} /> */}
          <Link
            href={ROUTES.PROFILE_ORGANIZATION_MEMBER(organization.id)}
            aria-label="그룹원 관리"
          >
            <Users className="fill-dark stroke-dark" size={20} />
          </Link>
        </div>
      )}
    </div>
  );
}

export default Organization;
