"use client";
import { useState } from "react";

import { InfoMessage } from "@/shared/ui/InfoMessage";
import { SearchInput } from "@/shared/ui/SearchInput";
import { Tag } from "@/shared/ui/Tag";
import { CouponListWidget } from "@/widgets/coupon/ui/CouponListWidget";
import { Header } from "@/widgets/header";

function SearchPage() {
  const tags = ["스타벅스", "GS25", "푸라닭"];
  const [keyword, setKeyword] = useState("");

  return (
    <div className="relative">
      <Header
        title="검색"
        withOrganizationButton
        withSearchButton
        withBackButton
      />

      <div className="mb-5 flex flex-col gap-3.5 px-4">
        <SearchInput
          className="mt-1"
          placeholder="찾고 싶은 쿠폰의 키워드를 입력해 보세요"
          name="keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onXButtonClick={() => setKeyword("")}
        />
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

      {keyword.length === 0 ? (
        <InfoMessage
          title="입력된 키워드가 없어요"
          description="키워드를 입력해서 원하는 쿠폰을 찾아보세요"
        />
      ) : (
        <CouponListWidget keyword={keyword.toUpperCase()} />
      )}
    </div>
  );
}

export default SearchPage;
