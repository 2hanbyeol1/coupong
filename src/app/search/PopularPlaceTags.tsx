"use client";
import { useQuery } from "@tanstack/react-query";

import { searchCouponSuggestionsOption } from "@/entities/coupon/api/query";
import { useOrganizationStore } from "@/entities/organization/model/store";
import { cn } from "@/shared/lib/util/cn";
import { chipVariants } from "@/shared/ui";

const MAX_POPULAR_PLACES = 10;

interface PopularPlaceTagsProps {
  onSelect: (place: string) => void;
}

/** 선택한 그룹에서 쿠폰을 많이 등록한 사용처를 추천 검색어로 보여줌 */
function PopularPlaceTags({ onSelect }: PopularPlaceTagsProps) {
  const { selectedOrganizationId } = useOrganizationStore();

  const { data: places, isLoading } = useQuery({
    ...searchCouponSuggestionsOption({
      organizationId: selectedOrganizationId,
      field: "place",
      limit: MAX_POPULAR_PLACES,
    }),
    // 추천 검색어를 못 불러와도 검색은 할 수 있으므로 화면 전체를 에러로 바꾸지 않음
    throwOnError: false,
  });

  // 불러오는 동안 자리를 잡아 두어 아래 내용이 밀려 내려가지 않게 함
  // (그룹을 선택하지 않아 요청하지 않을 때는 isLoading이 false)
  if (isLoading) return <div className="mb-5 h-7" />;
  if (!places || places.length === 0) return null;

  return (
    // 많으면 가로로 넘겨서 보기 (스크롤바는 숨김)
    <div className="mb-5 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {places.map((place) => (
        <button
          key={place}
          type="button"
          onClick={() => onSelect(place)}
          className={cn(chipVariants({ size: "md" }), "cursor-pointer")}
        >
          {place}
        </button>
      ))}
    </div>
  );
}

export default PopularPlaceTags;
