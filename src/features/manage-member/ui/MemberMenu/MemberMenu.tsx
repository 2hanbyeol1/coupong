"use client";
import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  removeOrganizationMemberOption,
  setOrganizationMemberRoleOption,
} from "@/entities/organization/api/query";
import { OrganizationMemberType } from "@/entities/organization/api/type";
import useModal from "@/shared/lib/hook/useModal";
import useToast from "@/shared/lib/hook/useToast";
import { MoreMenu } from "@/shared/ui";

interface MemberMenuProps {
  member: OrganizationMemberType;
  name: string;
}

/** 관리자가 다른 그룹원의 권한을 바꾸거나 내보내는 메뉴 */
function MemberMenu({ member, name }: MemberMenuProps) {
  const queryClient = useQueryClient();
  const { showModal, hideModal, updateModal } = useModal();
  const { addToast } = useToast();

  const handleError = (error: Error) => {
    hideModal();
    addToast({ message: error.message });
  };

  const { mutate: setRole, isPending: isSettingRole } = useMutation(
    setOrganizationMemberRoleOption(queryClient, member.organization_id, {
      onSuccess: ({ role }) => {
        hideModal();
        addToast({
          message:
            role === "admin"
              ? `${name}님을 관리자로 지정했어요`
              : `${name}님을 일반 그룹원으로 바꿨어요`,
        });
      },
      onError: handleError,
    }),
  );

  const { mutate: removeMember, isPending: isRemoving } = useMutation(
    removeOrganizationMemberOption(queryClient, member.organization_id, {
      onSuccess: () => {
        hideModal();
        addToast({ message: `${name}님을 그룹에서 내보냈어요` });
      },
      onError: handleError,
    }),
  );

  const isPending = isSettingRole || isRemoving;

  useEffect(() => {
    updateModal({ confirmButtonDisabled: isPending });
  }, [isPending, updateModal]);

  const isAdmin = member.role === "admin";

  const openRoleModal = () => {
    showModal({
      title: isAdmin
        ? `${name}님을 일반 그룹원으로 바꿀까요?`
        : `${name}님을 관리자로 지정할까요?`,
      content: isAdmin
        ? "다른 사람이 올린 쿠폰을 수정·삭제하거나 그룹원을 관리할 수 없게 돼요."
        : "그룹의 모든 쿠폰을 수정·삭제하고 그룹원을 관리할 수 있게 돼요.",
      confirmButtonText: isAdmin ? "바꾸기" : "지정",
      onConfirm: () => {
        setRole({ memberId: member.id, role: isAdmin ? "member" : "admin" });
      },
    });
  };

  const openRemoveModal = () => {
    showModal({
      title: `${name}님을 내보낼까요?`,
      content: "다시 들어오려면 초대를 받아야 해요. 올린 쿠폰은 그룹에 남아요.",
      confirmButtonText: "내보내기",
      onConfirm: () => {
        removeMember(member.id);
      },
    });
  };

  return (
    <MoreMenu
      items={[
        {
          label: isAdmin ? "관리자 해제" : "관리자로 지정",
          onClick: openRoleModal,
        },
        { label: "내보내기", onClick: openRemoveModal, variant: "danger" },
      ]}
    />
  );
}

export default MemberMenu;
