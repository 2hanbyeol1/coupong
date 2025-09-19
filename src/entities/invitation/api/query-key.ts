export const INVITATION_QUERY_KEY = {
  ALL: () => ["invitation", "list"],
  BY_TOKEN: (token: string) => ["invitation", { token }],
} as const;
