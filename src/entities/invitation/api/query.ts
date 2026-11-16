import {
  mutationOptions,
  QueryClient,
  queryOptions,
} from "@tanstack/react-query";

import { checkIsUserBelongsToOrganization } from "@/entities/organization/api/api";
import { USER_QUERY_KEY } from "@/entities/user/api/query-key";

import {
  acceptInvitation,
  addInvitation,
  cancelInvitation,
  getInvitationByToken,
  getMyInvitations,
  getPendingInvitations,
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

export const getPendingInvitationsOption = (
  organizationId: InvitationType["organization_id"],
) =>
  queryOptions({
    queryKey: INVITATION_QUERY_KEY.PENDING(organizationId),
    queryFn: async () => await getPendingInvitations(organizationId),
  });

export const addInvitationOption = (queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: async ({
      inviteEmail,
      organizationId,
    }: {
      inviteEmail: InsertInvitationType["invite_email"];
      organizationId: InsertInvitationType["organization_id"];
    }) => await addInvitation(inviteEmail, organizationId),
    onSuccess: (_, { organizationId }) => {
      queryClient.invalidateQueries({
        queryKey: INVITATION_QUERY_KEY.PENDING(organizationId),
      });
    },
  });

export const cancelInvitationOption = (
  queryClient: QueryClient,
  organizationId: InvitationType["organization_id"],
  {
    onSuccess,
    onError,
  }: { onSuccess?: () => void; onError?: (error: Error) => void } = {},
) =>
  mutationOptions({
    mutationFn: async (invitationId: InvitationType["id"]) =>
      await cancelInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: INVITATION_QUERY_KEY.PENDING(organizationId),
      });
      onSuccess?.();
    },
    onError: (error) => {
      // 이미 수락·취소된 초대일 수 있으니 목록을 다시 불러옴
      queryClient.invalidateQueries({
        queryKey: INVITATION_QUERY_KEY.PENDING(organizationId),
      });
      onError?.(error);
    },
  });

export const acceptInvitationOption = (queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: async (token: InvitationType["token"]) =>
      await acceptInvitation(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY.GROUP_LIST });
    },
  });
