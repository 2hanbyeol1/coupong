import { queryOptions } from "@tanstack/react-query";

import { getOrganizationById } from "./api";
import { ORG_QUERY_KEY } from "./query-key";
import { OrganizationType } from "./type";

export const getOrganizationByIdOption = (orgId: OrganizationType["id"]) =>
  queryOptions({
    queryKey: ORG_QUERY_KEY.ORG(orgId),
    queryFn: async () => await getOrganizationById(orgId),
  });
