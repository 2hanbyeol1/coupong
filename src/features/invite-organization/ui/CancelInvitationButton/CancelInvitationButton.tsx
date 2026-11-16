"use client";
import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cancelInvitationOption } from "@/entities/invitation/api/query";
import { InvitationType } from "@/entities/invitation/api/type";
import useModal from "@/shared/lib/hook/useModal";
import useToast from "@/shared/lib/hook/useToast";
import { Button } from "@/shared/ui";

interface CancelInvitationButtonProps {
  invitation: InvitationType;
}

function CancelInvitationButton({ invitation }: CancelInvitationButtonProps) {
  const queryClient = useQueryClient();
  const { showModal, hideModal, updateModal } = useModal();
  const { addToast } = useToast();

  const { mutate: cancelInvitation, isPending } = useMutation(
    cancelInvitationOption(queryClient, invitation.organization_id, {
      onSuccess: () => {
        hideModal();
        addToast({ message: "초대를 취소했어요" });
      },
      onError: (error) => {
        hideModal();
        addToast({ message: error.message });
      },
    }),
  );

  useEffect(() => {
    updateModal({ confirmButtonDisabled: isPending });
  }, [isPending, updateModal]);

  const openCancelModal = () => {
    showModal({
      title: "초대를 취소할까요?",
      content: `${invitation.invite_email}(으)로 보낸 초대 링크를 더 이상 쓸 수 없어요.`,
      confirmButtonText: "초대 취소",
      cancelButtonText: "닫기",
      onConfirm: () => {
        cancelInvitation(invitation.id);
      },
    });
  };

  return (
    <Button
      size="sm"
      color="light"
      className="shrink-0"
      onClick={openCancelModal}
    >
      취소
    </Button>
  );
}

export default CancelInvitationButton;
