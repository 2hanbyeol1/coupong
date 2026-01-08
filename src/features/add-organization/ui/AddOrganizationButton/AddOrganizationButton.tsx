"use client";
import { Plus } from "lucide-react";

import AddOrganizationForm from "@/features/add-organization/ui/AddOrganizationButton/AddOrganizationForm";
import useModal from "@/shared/lib/hook/useModal";

function AddOrganizationButton() {
  const { showModal } = useModal();

  const openAddOrganizationModal = () => {
    showModal({
      title: "새 그룹 만들기",
      content: <AddOrganizationForm formId="add-organization" />,
      confirmButtonText: "등록",
      formId: "add-organization",
    });
  };

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
