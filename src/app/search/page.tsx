"use client";
import { useDeferredValue, useState } from "react";

import useDebouncedValue from "@/shared/lib/hook/useDebouncedValue";
import { InfoMessage } from "@/shared/ui/InfoMessage";
import { SearchInput } from "@/shared/ui/SearchInput";
import { Tag } from "@/shared/ui/Tag";
import { CouponListWidget } from "@/widgets/coupon/ui/CouponListWidget";
import { Header } from "@/widgets/header";

const SEARCH_DEBOUNCE = 300; // ms

function SearchPage() {
  const tags = ["스타벅스", "GS25", "푸라닭"];
  const [keyword, setKeyword] = useState("");
  // 입력할 때마다 서버에 요청하지 않고, 새 결과를 받는 동안 이전 결과를 보여줌
  const debouncedKeyword = useDebouncedValue(keyword.trim(), SEARCH_DEBOUNCE);
  const searchKeyword = useDeferredValue(debouncedKeyword);

  return (
    <div className="relative">
      <Header
        title="검색"
        withOrganizationButton
        withSearchButton
        withBackButton
      />

      {/* 스크롤해도 헤더(h-12) 바로 아래에 검색창을 고정
          배경 없이 검색창만 띄워, 지나가는 목록이 유리 너머로 비치게 함
          (검색창 바깥 여백은 아래 목록을 그대로 누를 수 있게 터치를 통과시킴) */}
      <div className="pointer-events-none sticky top-12 z-40 px-4 pt-1 pb-3.5">
        <SearchInput
          className="pointer-events-auto"
          placeholder="찾고 싶은 쿠폰의 키워드를 입력해 보세요"
          name="keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onXButtonClick={() => setKeyword("")}
        />
      </div>
      <div className="mb-5 px-4">
        <div className="flex gap-x-1.5 gap-y-2">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setKeyword(tag)}
              className="cursor-pointer"
            >
              <Tag name={tag} />
            </button>
          ))}
        </div>
      </div>

      {searchKeyword.length === 0 ? (
        <InfoMessage
          title="입력된 키워드가 없어요"
          description="키워드를 입력해서 원하는 쿠폰을 찾아보세요"
        />
      ) : (
        <CouponListWidget keyword={searchKeyword} />
      )}
    </div>
  );
}

export default SearchPage;
