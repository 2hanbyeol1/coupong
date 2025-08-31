import {
  infiniteQueryOptions,
  mutationOptions,
  QueryClient,
  queryOptions,
} from "@tanstack/react-query";

import { OrganizationType } from "@/entities/organization/api/type";

import {
  changeCouponUse,
  getCoupon,
  getCoupons,
  getImageSignedUrl,
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

export const getCouponImageOption = ({
  imagePath,
}: {
  imagePath: CouponType["image_path"];
}) =>
  queryOptions({
    queryKey: COUPON_QUERY_KEY.COUPON_IMAGE(imagePath),
    queryFn: async () => await getImageSignedUrl(imagePath),
    enabled: !!imagePath,
  });

export const changeCouponToUsedOption = (queryClient: QueryClient) => {
  return mutationOptions({
    mutationFn: async (couponId: CouponType["id"]) =>
      await changeCouponUse(couponId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: COUPON_QUERY_KEY.ALL,
      });
    },
  });
};
