"use client";
import { useQuery } from "@tanstack/react-query";

import { getPendingInvitationsOption } from "@/entities/invitation/api/query";
import { Invitation } from "@/entities/invitation/ui/Invitation";
import { OrganizationType } from "@/entities/organization/api/type";
import { MemberSkeleton } from "@/entities/organization/ui/Member";
import { CancelInvitationButton } from "@/features/invite-organization/ui/CancelInvitationButton";

interface PendingInvitationListProps {
  organizationId: OrganizationType["id"];
  myUserId: string;
  isAdmin: boolean;
}

/** 아직 수락되지 않은 초대 목록 (초대한 사람·관리자는 취소 가능) */
function PendingInvitationList({
  organizationId,
  myUserId,
  isAdmin,
}: PendingInvitationListProps) {
  const {
    data: invitations,
    isPending,
    isError,
  } = useQuery(getPendingInvitationsOption(organizationId));

  return (
    <section className="flex flex-col gap-2">
      <h2 className="flex items-center gap-1.5 text-base font-medium">
        초대 중
        {invitations && invitations.length > 0 && (
          <span className="text-dark">{invitations.length}</span>
        )}
      </h2>

      {isPending ? (
        <MemberSkeleton />
      ) : isError ? (
        <p className="text-dark py-2 text-sm">초대 목록을 불러오지 못했어요</p>
      ) : invitations.length === 0 ? (
        <p className="text-dark py-2 text-sm">초대 중인 사람이 없어요</p>
      ) : (
        <div className="flex flex-col">
          {invitations.map((invitation) => (
            <Invitation
              key={invitation.id}
              email={invitation.invite_email}
              inviterName={invitation.inviter?.name ?? "알 수 없음"}
              createdAt={invitation.created_at}
              action={
                (isAdmin || invitation.invited_by === myUserId) && (
                  <CancelInvitationButton invitation={invitation} />
                )
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default PendingInvitationList;
