import { OrganizationType } from "./type";

export const ORG_QUERY_KEY = {
  ORG: (orgId: OrganizationType["id"]) => ["org", orgId],
} as const;
