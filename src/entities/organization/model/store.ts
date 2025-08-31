import { create } from "zustand";
import { persist } from "zustand/middleware";

import { OrganizationType } from "@/entities/organization/api/type";

interface OrganizationStoreType {
  selectedOrgId: OrganizationType["id"] | null;
  setSelectedOrgId: (newOrgId: OrganizationType["id"]) => void;
}

export const useOrganizationStore = create<OrganizationStoreType>()(
  persist(
    (set) => ({
      selectedOrgId: null,
      setSelectedOrgId: (newOrgId) => set({ selectedOrgId: newOrgId }),
    }),
    { name: "organization" },
  ),
);
