import {
  infiniteQueryOptions,
  mutationOptions,
  QueryClient,
  queryOptions,
} from "@tanstack/react-query";

import { OrganizationType } from "@/entities/organization/api/type";
import { AddCouponFormValues } from "@/features/add-coupon/lib/schema";

import {
  addCoupons,
  changeCouponUse,
  deleteCoupon,
  getCoupon,
  getCoupons,
  getImageSignedUrl,
  searchCouponSuggestions,
  SearchCouponSuggestionsParams,
  SIGNED_URL_EXPIRES_IN,
  updateCoupon,
} from "./api";
import { COUPON_QUERY_KEY } from "./query-key";
import { CouponType } from "./type";

export const getInfiniteCouponsOption = (orgId: OrganizationType["id"]) =>
  infiniteQueryOptions({
    queryKey: COUPON_QUERY_KEY.LIST(orgId),
    queryFn: async ({ pageParam }) =>
      await getCoupons({ organizationId: orgId, page: pageParam, limit: 10 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, pageParam) =>
      lastPage.hasNext ? pageParam + 1 : undefined,
    select: (data) => data.pages.flatMap((page) => page.data),
  });

export const getCouponDetailOption = (couponId: CouponType["id"]) =>
  queryOptions({
    queryKey: COUPON_QUERY_KEY.DETAIL(couponId),
    queryFn: async () => await getCoupon(couponId),
  });

export const searchCouponSuggestionsOption = (
  {
    organizationId,
    ...params
  }: Omit<SearchCouponSuggestionsParams, "organizationId"> & {
    organizationId: OrganizationType["id"] | null;
  },
  { enabled = true }: { enabled?: boolean } = {},
) =>
  queryOptions({
    queryKey: COUPON_QUERY_KEY.SUGGESTIONS({ organizationId, ...params }),
    queryFn: async () =>
      await searchCouponSuggestions({
        organizationId: organizationId!,
        ...params,
      }),
    enabled: enabled && !!organizationId,
    staleTime: 60 * 1000,
    // 새 검색 결과를 받는 동안 이전 결과를 유지해 목록이 깜빡이지 않게
    // (다른 항목·다른 사용처의 결과가 보이지 않도록 그룹·항목·사용처가 같을 때만)
    placeholderData: (previousData, previousQuery) => {
      const previousParams = previousQuery?.queryKey[2] as
        | Partial<SearchCouponSuggestionsParams>
        | undefined;
      const isSameSearch =
        previousParams?.organizationId === organizationId &&
        previousParams?.field === params.field &&
        (previousParams?.place ?? "") === (params.place ?? "");
      return isSameSearch ? previousData : undefined;
    },
  });

export const getCouponImageOption = ({
  imagePath,
}: {
  imagePath: CouponType["image_path"];
}) =>
  queryOptions({
    queryKey: COUPON_QUERY_KEY.COUPON_IMAGE(imagePath),
    queryFn: async () => await getImageSignedUrl(imagePath),
    enabled: !!imagePath,
    // 서명 URL이 만료되기 5분 전에 새로 발급
    staleTime: SIGNED_URL_EXPIRES_IN * 1000 - 5 * 60 * 1000, // 55 minutes
    gcTime: SIGNED_URL_EXPIRES_IN * 1000 - 5 * 60 * 1000, // 55 minutes
  });

// 쿠폰 정보가 바뀌어도 이미지는 그대로이므로 서명 URL은 다시 발급하지 않음
// (다시 발급하면 URL이 바뀌어 같은 이미지를 새로 다운로드하게 됨)
const isNotCouponImageQuery = ({
  queryKey,
}: {
  queryKey: readonly unknown[];
}) => queryKey[1] !== COUPON_QUERY_KEY.COUPON_IMAGE_ALL[1];

export const addCouponsOption = (
  queryClient: QueryClient,
  {
    onSuccess,
    onError,
  }: { onSuccess?: () => void; onError?: (error: Error) => void },
) => {
  return mutationOptions({
    mutationFn: async ({
      formValues,
      orgId,
    }: {
      formValues: AddCouponFormValues;
      orgId: OrganizationType["id"];
    }) => await addCoupons(formValues, orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: COUPON_QUERY_KEY.ALL,
        predicate: isNotCouponImageQuery,
      });
      onSuccess?.();
    },
    onError,
  });
};

export const changeCouponToUsedOption = (queryClient: QueryClient) => {
  return mutationOptions({
    mutationFn: async (couponId: CouponType["id"]) =>
      await changeCouponUse(couponId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: COUPON_QUERY_KEY.ALL,
        predicate: isNotCouponImageQuery,
      });
    },
  });
};

export const updateCouponOption = (
  queryClient: QueryClient,
  {
    onSuccess,
    onError,
  }: { onSuccess?: () => void; onError?: (error: Error) => void } = {},
) => {
  return mutationOptions({
    mutationFn: async ({
      couponId,
      changes,
    }: {
      couponId: CouponType["id"];
      changes: Partial<Pick<CouponType, "name" | "place" | "expire_at">>;
    }) => await updateCoupon(couponId, changes),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: COUPON_QUERY_KEY.ALL,
        predicate: isNotCouponImageQuery,
        refetchType: "all",
      });
      onSuccess?.();
    },
    onError,
  });
};

export const deleteCouponOption = (
  queryClient: QueryClient,
  {
    onSuccess,
    onError,
  }: { onSuccess?: () => void; onError?: (error: Error) => void } = {},
) => {
  return mutationOptions({
    mutationFn: async (couponId: CouponType["id"]) =>
      await deleteCoupon(couponId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: COUPON_QUERY_KEY.LIST_ALL,
        refetchType: "all",
      });
      onSuccess?.();
    },
    onError,
  });
};
