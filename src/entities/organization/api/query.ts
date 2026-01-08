import {
  mutationOptions,
  QueryClient,
  queryOptions,
} from "@tanstack/react-query";

import { addToOrganization } from "@/entities/user/api/api";
import { USER_QUERY_KEY } from "@/entities/user/api/query-key";
import { AddOrganizationFormValues } from "@/features/add-organization/lib/schema";

import {
  addOrganization,
  getOrganizationById,
  getOrganizationMembers,
} from "./api";
import { ORG_QUERY_KEY } from "./query-key";
import { OrganizationType } from "./type";

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
    }) =>
      await addOrganization(organization).then((data) =>
        addToOrganization(data[0].id),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USER_QUERY_KEY.GROUP_LIST,
      });
      onSuccess?.();
    },
    onError,
  });
};
