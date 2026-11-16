"use client";
import { useQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";

import {
  getOrganizationByIdOption,
  getOrganizationMembersOption,
} from "@/entities/organization/api/query";
import { OrganizationType } from "@/entities/organization/api/type";
import { Member, MemberSkeleton } from "@/entities/organization/ui/Member";
import { getMyInfoOption } from "@/entities/user/api/query";
import { InviteOrganizationButton } from "@/features/invite-organization/ui/InviteOrganizationButton";
import { MemberMenu } from "@/features/manage-member/ui/MemberMenu";
import { InfoMessage } from "@/shared/ui/InfoMessage";
import Iterator from "@/shared/ui/Iterator/Iterator";
import Skeleton from "@/shared/ui/Skeleton";

interface OrganizationMemberWidgetProps {
  organizationId: OrganizationType["id"];
}

function OrganizationMemberWidget({
  organizationId,
}: OrganizationMemberWidgetProps) {
  const organizationQuery = useQuery(getOrganizationByIdOption(organizationId));
  const membersQuery = useQuery(getOrganizationMembersOption(organizationId));
  const meQuery = useQuery(getMyInfoOption());

  if (organizationQuery.isError || membersQuery.isError || meQuery.isError)
    return (
      <InfoMessage
        title="그룹원을 불러오는 중 오류가 발생했어요"
        description="잠시 후 다시 시도해 주세요"
      />
    );

  if (
    organizationQuery.isPending ||
    membersQuery.isPending ||
    meQuery.isPending
  )
    return (
      <div className="flex flex-col gap-5 px-6 py-6">
        <Skeleton className="w-40" textSize="xl" />
        <div className="flex flex-col">
          <Iterator
            count={4}
            render={(idx) => <MemberSkeleton key={`member-skeleton-${idx}`} />}
          />
        </div>
      </div>
    );

  const organization = organizationQuery.data;
  const members = membersQuery.data;
  const me = meQuery.data;
  const myMembership = members.find((member) => member.user_id === me.user_id);

  // 그룹이 없거나 내가 속하지 않은 그룹
  if (!organization || !myMembership) notFound();

  const isAdmin = myMembership.role === "admin";

  return (
    <div className="flex flex-col gap-5 px-6 py-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="flex min-w-0 items-center gap-2 text-xl font-medium">
          <span className="truncate">{organization.name}</span>
          <span className="text-dark shrink-0">{members.length}</span>
        </h1>
        <InviteOrganizationButton organization={organization} />
      </div>

      <div className="flex flex-col">
        {members.map((member) => {
          const isMe = member.user_id === me.user_id;
          const name = member.user?.name ?? "알 수 없음";
          return (
            <Member
              key={member.id}
              userId={member.user_id}
              name={name}
              role={member.role}
              isMe={isMe}
              action={
                isAdmin && !isMe && <MemberMenu member={member} name={name} />
              }
            />
          );
        })}
      </div>
    </div>
  );
}

export default OrganizationMemberWidget;
