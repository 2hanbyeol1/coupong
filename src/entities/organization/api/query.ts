import {
  mutationOptions,
  QueryClient,
  queryOptions,
} from "@tanstack/react-query";

import { USER_QUERY_KEY } from "@/entities/user/api/query-key";
import { AddOrganizationFormValues } from "@/features/add-organization/lib/schema";

import {
  addOrganization,
  getMyOrganizationIds,
  getMyOrganizationRole,
  getOrganizationById,
  getOrganizationMembers,
  removeOrganizationMember,
  setOrganizationMemberRole,
} from "./api";
import { ORG_QUERY_KEY } from "./query-key";
import {
  OrganizationMemberType,
  OrganizationRole,
  OrganizationType,
} from "./type";

export const getOrganizationByIdOption = (orgId: OrganizationType["id"]) =>
  queryOptions({
    queryKey: ORG_QUERY_KEY.ORGANIZATION(orgId),
    queryFn: async () => await getOrganizationById(orgId),
  });

export const getOrganizationMembersOption = (orgId: OrganizationType["id"]) =>
  queryOptions({
    queryKey: ORG_QUERY_KEY.ORGANIZATION_MEMBERS(orgId),
    queryFn: async () => await getOrganizationMembers(orgId),
  });

/** 내가 속한 그룹 id 목록 (그룹 목록을 다시 불러올 때 함께 갱신) */
export const getMyOrganizationIdsOption = () =>
  queryOptions({
    queryKey: [...USER_QUERY_KEY.GROUP_LIST, "ids"],
    queryFn: async () => await getMyOrganizationIds(),
  });

export const getMyOrganizationRoleOption = (orgId: OrganizationType["id"]) =>
  queryOptions({
    queryKey: ORG_QUERY_KEY.MY_ROLE(orgId),
    queryFn: async () => await getMyOrganizationRole(orgId),
  });

export const addOrganizationOption = (
  queryClient: QueryClient,
  {
    onSuccess,
    onError,
  }: { onSuccess?: () => void; onError?: (error: Error) => void },
) => {
  return mutationOptions({
    mutationFn: async ({
      organization,
    }: {
      organization: AddOrganizationFormValues;
    }) => await addOrganization(organization),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USER_QUERY_KEY.GROUP_LIST,
      });
      onSuccess?.();
    },
    onError,
  });
};

interface MutationCallbacks<TVariables> {
  onSuccess?: (variables: TVariables) => void;
  onError?: (error: Error) => void;
}

export const setOrganizationMemberRoleOption = (
  queryClient: QueryClient,
  orgId: OrganizationType["id"],
  {
    onSuccess,
    onError,
  }: MutationCallbacks<{
    memberId: OrganizationMemberType["id"];
    role: OrganizationRole;
  }> = {},
) =>
  mutationOptions({
    mutationFn: async ({
      memberId,
      role,
    }: {
      memberId: OrganizationMemberType["id"];
      role: OrganizationRole;
    }) => await setOrganizationMemberRole(memberId, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ORG_QUERY_KEY.ORGANIZATION_MEMBERS(orgId),
      });
      onSuccess?.(variables);
    },
    onError,
  });

export const removeOrganizationMemberOption = (
  queryClient: QueryClient,
  orgId: OrganizationType["id"],
  { onSuccess, onError }: MutationCallbacks<OrganizationMemberType["id"]> = {},
) =>
  mutationOptions({
    mutationFn: async (memberId: OrganizationMemberType["id"]) =>
      await removeOrganizationMember(memberId),
    onSuccess: (_, memberId) => {
      queryClient.invalidateQueries({
        queryKey: ORG_QUERY_KEY.ORGANIZATION_MEMBERS(orgId),
      });
      onSuccess?.(memberId);
    },
    onError,
  });
