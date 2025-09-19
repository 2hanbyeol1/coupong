import { mutationOptions, queryOptions } from "@tanstack/react-query";

import { checkIsUserBelongsToOrganization } from "@/entities/organization/api/api";
import { addToOrganization } from "@/entities/user/api/api";

import {
  addInvitation,
  approveInvitation,
  getInvitationByToken,
  getMyInvitations,
} from "./api";
import { INVITATION_QUERY_KEY } from "./query-key";
import { InsertInvitationType, InvitationType } from "./type";

export const getMyInvitationsOption = () =>
  queryOptions({
    queryKey: INVITATION_QUERY_KEY.ALL(),
    queryFn: async () => await getMyInvitations(),
  });

export const getInvitationByTokenOption = (token: InvitationType["token"]) =>
  queryOptions({
    queryKey: INVITATION_QUERY_KEY.BY_TOKEN(token),
    queryFn: async () => {
      const invitation = await getInvitationByToken(token);
      if (!invitation) return null;
      const isBelongsToOrganization = await checkIsUserBelongsToOrganization(
        invitation.organizations.id,
      );
      return {
        ...invitation,
        organization: invitation.organizations,
        isBelongsToOrganization,
      };
    },
  });

export const addInvitationOption = () =>
  mutationOptions({
    mutationFn: async ({
      inviteEmail,
      organizationId,
    }: {
      inviteEmail: InsertInvitationType["invite_email"];
      organizationId: InsertInvitationType["organization_id"];
    }) => await addInvitation(inviteEmail, organizationId),
  });

export const approveInvitationOption = () =>
  mutationOptions({
    mutationFn: async ({
      invitationId,
      organizationId,
    }: {
      invitationId: InvitationType["id"];
      organizationId: InvitationType["organization_id"];
    }) =>
      await approveInvitation(invitationId).then(() => {
        addToOrganization(organizationId);
      }),
  });
