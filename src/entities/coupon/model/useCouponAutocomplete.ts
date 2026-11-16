"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { searchCouponSuggestionsOption } from "@/entities/coupon/api/query";
import { OrganizationType } from "@/entities/organization/api/type";
import useDebouncedValue from "@/shared/lib/hook/useDebouncedValue";

export type CouponAutocompleteField = "place" | "name";

const MAX_AUTOCOMPLETE_ITEMS = 5;
const AUTOCOMPLETE_DEBOUNCE_MS = 250;

interface UseCouponAutocompleteParams {
  organizationId: OrganizationType["id"] | null;
  /** 자동완성 목록을 띄울 입력칸 (없으면 검색하지 않음) */
  field: CouponAutocompleteField | null;
  /** 입력칸에 입력한 글자 */
  query: string;
  /** 쿠폰 이름은 이 사용처에서 쓰였던 이름을 먼저 */
  place?: string;
  /** 서버에 아직 없는, 이번에 입력한 값도 후보로 */
  sessionValues?: Partial<Record<CouponAutocompleteField, string[]>>;
}

/**
 * 입력이 잠시 멈추면 그 칸의 값으로 그룹에서 쓰였던 사용처·쿠폰 이름을 검색
 * 결과가 어느 칸의 것인지(field)도 같이 돌려줘, 다른 칸의 결과를 보여주지 않게 함
 */
function useCouponAutocomplete({
  organizationId,
  field,
  query,
  place = "",
  sessionValues,
}: UseCouponAutocompleteParams) {
  const trimmedQuery = query.trim();
  const params = useMemo(
    () => ({
      field,
      query: trimmedQuery,
      place: field === "name" ? place.trim() : "",
    }),
    [field, trimmedQuery, place],
  );
  const debouncedParams = useDebouncedValue(params, AUTOCOMPLETE_DEBOUNCE_MS);
  const isDebouncing = debouncedParams !== params;

  const { data: items = [], isFetching } = useQuery(
    searchCouponSuggestionsOption(
      {
        organizationId,
        field: debouncedParams.field ?? "place",
        query: debouncedParams.query,
        place: debouncedParams.place,
        sessionValues: debouncedParams.field
          ? (sessionValues?.[debouncedParams.field] ?? [])
          : [],
        limit: MAX_AUTOCOMPLETE_ITEMS,
      },
      { enabled: !!debouncedParams.field && debouncedParams.query !== "" },
    ),
  );

  return {
    items,
    /** items를 검색한 입력칸 */
    field: debouncedParams.field,
    isLoading: isDebouncing || isFetching,
  };
}

export default useCouponAutocomplete;
