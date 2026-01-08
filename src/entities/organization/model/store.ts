import { create } from "zustand";
import { persist } from "zustand/middleware";

import { OrganizationType } from "@/entities/organization/api/type";

export const ORGANIZATION_STORE_KEY = "organization";

interface OrganizationStoreType {
  selectedOrganizationId: OrganizationType["id"] | null;
  setSelectedOrganizationId: (newOrgId: OrganizationType["id"]) => void;
  resetSelectedOrganizationId: () => void;
}

export const useOrganizationStore = create<OrganizationStoreType>()(
  persist(
    (set) => ({
      selectedOrganizationId: null,
      setSelectedOrganizationId: (newOrgId) =>
        set({ selectedOrganizationId: newOrgId }),
      resetSelectedOrganizationId: () => set({ selectedOrganizationId: null }),
    }),
    { name: ORGANIZATION_STORE_KEY },
  ),
);
