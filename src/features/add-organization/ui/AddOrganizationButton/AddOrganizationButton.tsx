"use client";
import { Plus } from "lucide-react";

import useAddOrganizationModal from "./useAddOrganizationModal";

function AddOrganizationButton() {
  const openAddOrganizationModal = useAddOrganizationModal();

  return (
    <button
      type="button"
      className="flex items-center gap-1"
      onClick={openAddOrganizationModal}
    >
      <Plus className="stroke-primary stroke-3" size={14} />
      <span className="text-primary text-sm font-medium">새 그룹 만들기</span>
    </button>
  );
}

export default AddOrganizationButton;
