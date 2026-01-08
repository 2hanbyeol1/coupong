"use client";
import { UserPlus } from "lucide-react";

import { OrganizationType } from "@/entities/organization/api/type";
import useModal from "@/shared/lib/hook/useModal";

import { InviteOrganizationForm } from "../InviteOrganizationForm";

interface InviteOrganizationButtonProps {
  organization: OrganizationType;
}

function InviteOrganizationButton({
  organization,
}: InviteOrganizationButtonProps) {
  const { showModal } = useModal();

  const openInviteOrganizationModal = () => {
    showModal({
      title: `[${organization.name}] 그룹 초대`,
      content: (
        <InviteOrganizationForm
          formId="invite-organization"
          organization={organization}
        />
      ),
      confirmButtonText: "초대",
      formId: "invite-organization",
    });
  };

  return (
    <button className="cursor-pointer" onClick={openInviteOrganizationModal}>
      <UserPlus className="stroke-primary fill-primary" size={20} />
    </button>
  );
}

export default InviteOrganizationButton;
