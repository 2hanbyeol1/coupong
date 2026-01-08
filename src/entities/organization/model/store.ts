import { create } from "zustand";
import { persist } from "zustand/middleware";

import { OrganizationType } from "@/entities/organization/api/type";

export const ORGANIZATION_STORE_KEY = "organization";

interface OrganizationStoreType {
  selectedOrganizationId: OrganizationType["id"] | null;
  isHydrated: boolean;
  setSelectedOrganizationId: (newOrgId: OrganizationType["id"]) => void;
}

export const useOrganizationStore = create<OrganizationStoreType>()(
  persist(
    (set) => ({
      selectedOrganizationId: null,
      isHydrated: false,
      setSelectedOrganizationId: (newOrgId) =>
        set({ selectedOrganizationId: newOrgId }),
    }),
    {
      name: ORGANIZATION_STORE_KEY,
      onRehydrateStorage: () => (state) => {
        if (state) state.isHydrated = true;
      },
    },
  ),
);
