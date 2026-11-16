export const INVITATION_QUERY_KEY = {
  ALL: () => ["invitation", "list"],
  BY_TOKEN: (token: string) => ["invitation", { token }],
  PENDING: (organizationId: string) => [
    "invitation",
    "pending",
    organizationId,
  ],
} as const;
