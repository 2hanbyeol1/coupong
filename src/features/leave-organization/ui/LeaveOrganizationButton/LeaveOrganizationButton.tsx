"use client";
import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";

import { removeOrganizationCouponImages } from "@/entities/coupon/api/api";
import { COUPON_QUERY_KEY } from "@/entities/coupon/api/query-key";
import { leaveOrganization } from "@/entities/organization/api/api";
import { getOrganizationMembersOption } from "@/entities/organization/api/query";
import { ORG_QUERY_KEY } from "@/entities/organization/api/query-key";
import { OrganizationType } from "@/entities/organization/api/type";
import { useOrganizationStore } from "@/entities/organization/model/store";
import { getUserGroups } from "@/entities/user/api/api";
import { getMyInfoOption } from "@/entities/user/api/query";
import { USER_QUERY_KEY } from "@/entities/user/api/query-key";
import useModal from "@/shared/lib/hook/useModal";
import useToast from "@/shared/lib/hook/useToast";

import NewAdminPicker, { NewAdminCandidate } from "./NewAdminPicker";

interface LeaveOrganizationButtonProps {
  organization: OrganizationType;
}

/** 나가기 전에 확인 창에 보여줄 상황 */
type LeaveSituation =
  | { type: "last-member" }
  | { type: "last-admin"; candidates: NewAdminCandidate[] }
  | { type: "normal" };

function LeaveOrganizationButton({
  organization,
}: LeaveOrganizationButtonProps) {
  const queryClient = useQueryClient();
  const { showModal, hideModal, updateModal } = useModal();
  const { addToast } = useToast();
  // 확인 창에서 고른 새 관리자 (확인 버튼을 누를 때 읽음)
  const newAdminIdRef = useRef<NewAdminCandidate["id"] | undefined>(undefined);

  const { mutate: leave, isPending } = useMutation({
    mutationFn: async ({
      isLastMember,
      newAdminMemberId,
    }: {
      isLastMember: boolean;
      newAdminMemberId?: NewAdminCandidate["id"];
    }) => {
      // 그룹이 삭제되면 사진에 접근할 권한도 사라지므로 미리 지움
      if (isLastMember) await removeOrganizationCouponImages(organization.id);
      return await leaveOrganization(organization.id, newAdminMemberId);
    },
    onSuccess: async ({ deleted, newAdminName }) => {
      hideModal();
      addToast({
        message: deleted
          ? `${organization.name} 그룹을 삭제했어요`
          : newAdminName
            ? `${organization.name}에서 나갔어요. ${newAdminName}님이 관리자가 됐어요`
            : `${organization.name}에서 나갔어요`,
      });

      queryClient.invalidateQueries({ queryKey: ORG_QUERY_KEY.ALL });
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY.GROUP_LIST });
      queryClient.invalidateQueries({ queryKey: COUPON_QUERY_KEY.ALL });
      await selectAnotherOrganization();
    },
    onError: (error) => {
      hideModal();
      addToast({ message: error.message });
    },
  });

  useEffect(() => {
    updateModal({ confirmButtonDisabled: isPending });
  }, [isPending, updateModal]);

  /** 나간 그룹을 선택하고 있었다면 남은 그룹 중 가장 최근에 들어간 그룹을 선택 */
  const selectAnotherOrganization = async () => {
    const {
      selectedOrganizationId,
      setSelectedOrganizationId,
      resetSelectedOrganization,
    } = useOrganizationStore.getState();
    if (selectedOrganizationId !== organization.id) return;

    try {
      const { data } = await getUserGroups({ page: 1, limit: 1 });
      const next = data.flatMap((group) => group.organizations)[0];
      if (next) setSelectedOrganizationId(next.id);
      else resetSelectedOrganization();
    } catch {
      resetSelectedOrganization();
    }
  };

  const getLeaveSituation = async (): Promise<LeaveSituation> => {
    const [me, members] = await Promise.all([
      queryClient.fetchQuery(getMyInfoOption()),
      queryClient.fetchQuery({
        ...getOrganizationMembersOption(organization.id),
        staleTime: 0,
      }),
    ]);
    const others = members.filter((member) => member.user_id !== me?.user_id);
    const isAdmin = members.some(
      (member) => member.user_id === me?.user_id && member.role === "admin",
    );

    if (others.length === 0) return { type: "last-member" };
    if (isAdmin && !others.some((member) => member.role === "admin")) {
      // 가장 먼저 들어온 그룹원이 맨 위(기본 선택)
      const candidates = [...others].sort((a, b) =>
        a.created_at.localeCompare(b.created_at),
      );
      return { type: "last-admin", candidates };
    }
    return { type: "normal" };
  };

  const openLeaveModal = async () => {
    let situation: LeaveSituation;
    try {
      situation = await getLeaveSituation();
    } catch {
      addToast({ message: "그룹 정보를 불러오지 못했어요" });
      return;
    }

    if (situation.type === "last-member") {
      showModal({
        title: `${organization.name} 그룹을 삭제할까요?`,
        content:
          "그룹원이 나뿐이라 나가면 그룹과 모든 쿠폰이 삭제돼요. 삭제한 그룹은 되돌릴 수 없어요.",
        confirmButtonText: "삭제하고 나가기",
        onConfirm: () => leave({ isLastMember: true }),
      });
      return;
    }

    if (situation.type === "last-admin") {
      newAdminIdRef.current = situation.candidates[0]?.id;
      showModal({
        title: `${organization.name}에서 나갈까요?`,
        content: (
          <div className="flex flex-col gap-4">
            <p>
              내가 마지막 관리자라 새 관리자를 골라야 해요.
              <br />
              다시 들어오려면 초대를 받아야 해요.
            </p>
            <NewAdminPicker
              candidates={situation.candidates}
              onChange={(memberId) => {
                newAdminIdRef.current = memberId;
              }}
            />
          </div>
        ),
        confirmButtonText: "나가기",
        onConfirm: () =>
          leave({
            isLastMember: false,
            newAdminMemberId: newAdminIdRef.current,
          }),
      });
      return;
    }

    showModal({
      title: `${organization.name}에서 나갈까요?`,
      content:
        "다시 들어오려면 초대를 받아야 해요. 내가 올린 쿠폰은 그룹에 남아요.",
      confirmButtonText: "나가기",
      onConfirm: () => leave({ isLastMember: false }),
    });
  };

  return (
    <button
      type="button"
      onClick={openLeaveModal}
      aria-label="그룹 나가기"
      className="cursor-pointer"
    >
      <LogOut className="stroke-dark" size={20} />
    </button>
  );
}

export default LeaveOrganizationButton;
