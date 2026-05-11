"use client";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { notFound, useParams, useRouter } from "next/navigation";

import {
  approveInvitationOption,
  getInvitationByTokenOption,
} from "@/entities/invitation/api/query";
import useToast from "@/shared/lib/hook/useToast";
import { isWeekPassed } from "@/shared/lib/util/date";
import { Button, Logo } from "@/shared/ui";
import { CenteredView } from "@/shared/ui/CenteredView";

function InvitationPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const toast = useToast();

  const { data: invitation } = useSuspenseQuery({
    ...getInvitationByTokenOption(token),
  });

  const { mutate: approveInvitation, isPending } = useMutation({
    ...approveInvitationOption(),
    onSuccess: () => {
      router.push("/");
      toast.addToast({
        message: "초대가 수락되었어요",
      });
    },
    onError: () => {
      toast.addToast({
        message: "초대 수락에 실패했어요",
      });
    },
  });

  if (!invitation) notFound();
  if (invitation.accepted !== null)
    throw new Error(
      `이미 ${invitation.accepted ? "수락" : "거절"}된 초대장이예요`,
    );
  if (isWeekPassed(invitation.created_at))
    throw new Error("기간이 지나 만료된 초대장이예요");
  if (invitation.isBelongsToOrganization)
    throw new Error("이미 참여 중인 그룹의 초대장이예요");

  return (
    <CenteredView className="max-w-60">
      <div className="flex flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-4">
          <Logo size={76} />

          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              초대장이 도착했어요!
            </h1>
            <p className="text-dark text-center text-base tracking-tight whitespace-pre-wrap">
              &quot;{invitation.organizations.name}&quot; 그룹에 참가하고
              <br />
              그룹원과 쿠폰을 공유해요! 🥰
            </p>
          </div>
        </div>

        <Button
          onClick={() =>
            approveInvitation({
              invitationId: invitation.id,
              organizationId: invitation.organizations.id,
            })
          }
          disabled={isPending}
        >
          초대 수락
        </Button>
      </div>
    </CenteredView>
  );
}

export default InvitationPage;
