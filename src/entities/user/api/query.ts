import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import { USER_QUERY_KEY } from "./query-key";
import { getUser, getUserGroups } from "./user";

export const getUserOption = () =>
  queryOptions({
    queryKey: USER_QUERY_KEY.USER,
    queryFn: async () => await getUser(),
  });

export const getInfiniteUserGroupsOption = () =>
  infiniteQueryOptions({
    queryKey: USER_QUERY_KEY.GROUP_LIST,
    queryFn: async ({ pageParam }) =>
      await getUserGroups({ page: pageParam, limit: 10 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, pageParam) =>
      lastPage.hasNext ? pageParam + 1 : undefined,
    select: (data) => data.pages.flatMap((page) => page.data),
  });
