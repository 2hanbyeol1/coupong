import { OrganizationType } from "./type";

export const ORG_QUERY_KEY = {
  ALL: ["organization"],
  ORGANIZATION: (organizationId: OrganizationType["id"]) => [
    "organization",
    organizationId,
  ],
  ORGANIZATION_MEMBERS: (organizationId: OrganizationType["id"]) => [
    "organization",
    "members",
    organizationId,
  ],
} as const;
