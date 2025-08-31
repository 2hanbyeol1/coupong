import { Check } from "lucide-react";

import { cn } from "@/shared/lib/util/cn";

import { OrganizationType } from "../../api/type";
import { useOrganizationStore } from "../../model/store";

function Organization(organization: OrganizationType) {
  const { selectedOrgId } = useOrganizationStore();
  const isSelectedOrg = organization.id === selectedOrgId;

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {isSelectedOrg ? (
          <div className="bg-primary flex h-5 w-5 items-center justify-center rounded-full">
            <Check className="stroke-light stroke-4" size={12} />
          </div>
        ) : (
          <div className="bg-light flex h-5 w-5 items-center justify-center rounded-full"></div>
        )}
        <div
          className={cn(
            "py-2 font-medium",
            isSelectedOrg && "text-primary font-semibold",
          )}
        >
          {organization.name}
        </div>
      </div>
      {/* // ! */}
      {/* {isSelectedOrg && (
        <div className="flex items-center gap-3">
          <Users className="fill-dark stroke-dark" size={20} />
          <LogOut className="stroke-dark" size={20} />
        </div>
      )} */}
    </div>
  );
}

export default Organization;
