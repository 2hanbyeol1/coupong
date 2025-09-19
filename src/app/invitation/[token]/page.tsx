"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

import {
  approveInvitationOption,
  getInvitationByTokenOption,
} from "@/entities/invitation/api/query";
import useToast from "@/shared/lib/hook/useToast";
import { isWeekPassed } from "@/shared/lib/util/date";
import { Button } from "@/shared/ui";
import { CenteredView } from "@/shared/ui/CenteredView";

function InvitationPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const toast = useToast();

  const {
    data: invitation,
    isPending,
    isError,
  } = useQuery({
    ...getInvitationByTokenOption(token),
  });

  const { mutate: approveInvitation, isPending: isApproveInvitationPending } =
    useMutation({
      ...approveInvitationOption(),
      onSuccess: () => {
        router.push("/");
        toast.addToast({
          type: "success",
          message: "초대가 수락되었어요",
        });
      },
      onError: () => {
        toast.addToast({
          type: "error",
          message: "초대 수락에 실패했어요",
        });
      },
    });

  if (isPending) return <div>로딩중...</div>;
  if (isError) return <div>에러가 발생했어요.</div>;

  const getInvalidInvitationMessage = () => {
    if (!invitation) return "초대 정보가 존재하지 않습니다";
    if (invitation.accepted !== null)
      return `이미 ${invitation.accepted ? "수락" : "거절"}된 초대장이예요`;
    if (isWeekPassed(invitation.created_at))
      return "기간이 지나 만료된 초대장이예요";
    if (invitation.isBelongsToOrganization)
      return "이미 참여 중인 그룹의 초대장이예요";
    return "";
  };

  if (!invitation || !!getInvalidInvitationMessage()) {
    return (
      <CenteredView className="gap-10">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            사용할 수 없는 초대장
          </h1>
          <p className="text-dark text-base tracking-tight">
            {getInvalidInvitationMessage()}
          </p>
        </div>
        <Button href="/" color="light">
          메인으로 돌아가기
        </Button>
      </CenteredView>
    );
  }

  return (
    <CenteredView className="gap-10">
      <div className="flex flex-col items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          초대장이 도착했어요!
        </h1>
        <p className="text-dark text-base tracking-tight">
          {invitation.organizations.name} 그룹에 참가하고 쿠폰을 공유해보세요
        </p>
      </div>
      <Button
        color="light"
        onClick={() =>
          approveInvitation({
            invitationId: invitation.id,
            organizationId: invitation.organizations.id,
          })
        }
        disabled={isApproveInvitationPending}
      >
        초대 수락
      </Button>
    </CenteredView>
  );
}

export default InvitationPage;
