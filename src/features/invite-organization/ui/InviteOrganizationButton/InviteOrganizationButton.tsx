"use client";
import { UserPlus } from "lucide-react";

import { OrganizationType } from "@/entities/organization/api/type";
import useModal from "@/shared/lib/hook/useModal";
import { Button } from "@/shared/ui";

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
    <Button
      size="sm"
      className="shrink-0"
      onClick={openInviteOrganizationModal}
    >
      <UserPlus className="fill-white stroke-white" size={16} />
      초대
    </Button>
  );
}

export default InviteOrganizationButton;
