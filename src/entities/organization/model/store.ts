import { create } from "zustand";
import { persist } from "zustand/middleware";

import { OrganizationType } from "@/entities/organization/api/type";

interface OrganizationStoreType {
  selectedOrganizationId: OrganizationType["id"] | null;
  setSelectedOrganizationId: (newOrgId: OrganizationType["id"]) => void;
}

export const useOrganizationStore = create<OrganizationStoreType>()(
  persist(
    (set) => ({
      selectedOrganizationId: null,
      setSelectedOrganizationId: (newOrgId) =>
        set({ selectedOrganizationId: newOrgId }),
    }),
    { name: "organization" },
  ),
);
