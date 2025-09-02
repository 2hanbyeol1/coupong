import {
  infiniteQueryOptions,
  mutationOptions,
  queryOptions,
} from "@tanstack/react-query";

import {
  getSessionUser,
  getUserById,
  getUserGroups,
  updateUserProfile,
  uploadUserImage,
} from "./api";
import { USER_QUERY_KEY } from "./query-key";
import { UserType } from "./type";

export const getMyInfoOption = () =>
  queryOptions({
    queryKey: USER_QUERY_KEY.USER(""),
    queryFn: async () => await getSessionUser(),
  });

export const getUserOption = (userId: UserType["user_id"]) =>
  queryOptions({
    queryKey: USER_QUERY_KEY.USER(userId),
    queryFn: async () =>
      userId ? await getUserById(userId) : await getSessionUser(),
  });

export const getInfiniteOrganizationsOption = () =>
  infiniteQueryOptions({
    queryKey: USER_QUERY_KEY.GROUP_LIST,
    queryFn: async ({ pageParam }) =>
      await getUserGroups({ page: pageParam, limit: 10 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, pageParam) =>
      lastPage.hasNext ? pageParam + 1 : undefined,
    select: (data) =>
      data.pages.flatMap((page) =>
        page.data.flatMap((org) => org.organizations),
      ),
  });

export const updateUserProfileOption = () =>
  mutationOptions({
    mutationFn: async (newProfile: Partial<UserType>) =>
      await updateUserProfile(newProfile),
  });

export const uploadUserImageOption = () =>
  mutationOptions({
    mutationFn: async ({
      userId,
      newUserImage,
    }: {
      userId: string;
      newUserImage: File;
    }) => await uploadUserImage(userId, newUserImage),
  });
