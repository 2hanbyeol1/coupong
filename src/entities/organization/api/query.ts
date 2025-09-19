import { queryOptions } from "@tanstack/react-query";

import { getOrganizationById, getOrganizationMembers } from "./api";
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
