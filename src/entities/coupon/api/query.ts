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
  cancelCouponUse,
  changeCouponUse,
  CouponChanges,
  CouponListFilter,
  CouponUploadStatus,
  deleteCoupon,
  deleteCouponUsage,
  getCoupon,
  getCouponCount,
  getCoupons,
  getCouponUsages,
  searchCouponSuggestions,
  SearchCouponSuggestionsParams,
  spendAmountCoupon,
  updateCoupon,
} from "./api";
import { getImageSignedUrl } from "./image-url";
import { COUPON_QUERY_KEY } from "./query-key";
import { CouponType, CouponUsageType } from "./type";

/** 목록 탭(status)의 쿠폰. keyword가 있으면 사용처·이름에 키워드가 포함된 쿠폰만 (서버에서 검색) */
export const getInfiniteCouponsOption = ({
  organizationId,
  status,
  keyword,
}: CouponListFilter) =>
  infiniteQueryOptions({
    queryKey: COUPON_QUERY_KEY.LIST(organizationId, status, keyword),
    queryFn: async ({ pageParam }) =>
      await getCoupons({
        organizationId,
        status,
        keyword,
        page: pageParam,
        limit: 10,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, pageParam) =>
      lastPage.hasNext ? pageParam + 1 : undefined,
    select: (data) => data.pages.flatMap((page) => page.data),
  });

/** 목록 탭(status)에 있는 쿠폰 개수 */
export const getCouponCountOption = ({
  organizationId,
  status,
  keyword,
}: CouponListFilter) =>
  queryOptions({
    queryKey: COUPON_QUERY_KEY.COUNT(organizationId, status, keyword),
    queryFn: async () =>
      await getCouponCount({ organizationId, status, keyword }),
  });

export const getCouponDetailOption = (couponId: CouponType["id"]) =>
  queryOptions({
    queryKey: COUPON_QUERY_KEY.DETAIL(couponId),
    queryFn: async () => await getCoupon(couponId),
  });

/** 금액권 사용 내역 (최근에 쓴 순) */
export const getCouponUsagesOption = (couponId: CouponType["id"]) =>
  queryOptions({
    queryKey: COUPON_QUERY_KEY.USAGES(couponId),
    queryFn: async () => await getCouponUsages(couponId),
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
    // 언제 새로 발급할지는 getImageSignedUrl이 만료 시각을 보고 정함
    // (저장해 둔 URL은 남은 시간이 제각각이라 여기서 고정된 시간으로 정할 수 없음)
    // 아직 유효하면 같은 URL을 바로 돌려주므로 다시 불러도 요청이 나가지 않음
    staleTime: 0,
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
      onUploadStatusChange,
    }: {
      formValues: AddCouponFormValues;
      orgId: OrganizationType["id"];
      onUploadStatusChange?: (
        index: number,
        status: CouponUploadStatus,
      ) => void;
    }) => await addCoupons(formValues, orgId, onUploadStatusChange),
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

/**
 * 사용 완료 되돌리기
 * 토스트 버튼으로 실행해 그사이 화면을 벗어날 수 있으므로,
 * 결과 안내는 mutate 콜백 대신 여기(onSuccess/onError)로 받아 화면이 사라져도 실행되게 함
 */
export const cancelCouponUseOption = (
  queryClient: QueryClient,
  {
    onSuccess,
    onError,
  }: { onSuccess?: () => void; onError?: (error: Error) => void } = {},
) => {
  return mutationOptions({
    mutationFn: async (couponId: CouponType["id"]) =>
      await cancelCouponUse(couponId),
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

/** 금액권 사용 (쓴 금액을 기록하고 잔액에서 뺌), 결과는 사용 내역 id */
export const spendAmountCouponOption = (queryClient: QueryClient) => {
  return mutationOptions({
    mutationFn: async ({
      couponId,
      amount,
    }: {
      couponId: CouponType["id"];
      amount: number;
    }) => await spendAmountCoupon(couponId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: COUPON_QUERY_KEY.ALL,
        predicate: isNotCouponImageQuery,
      });
    },
  });
};

/**
 * 금액권 사용 기록 삭제 (토스트의 되돌리기·사용 내역의 삭제)
 * 토스트 버튼으로 실행해 그사이 화면을 벗어날 수 있으므로,
 * 결과 안내는 mutate 콜백 대신 여기(onSuccess/onError)로 받아 화면이 사라져도 실행되게 함
 */
export const deleteCouponUsageOption = (
  queryClient: QueryClient,
  {
    onSuccess,
    onError,
  }: { onSuccess?: () => void; onError?: (error: Error) => void } = {},
) => {
  return mutationOptions({
    mutationFn: async (usageId: CouponUsageType["id"]) =>
      await deleteCouponUsage(usageId),
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
      changes: CouponChanges;
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
