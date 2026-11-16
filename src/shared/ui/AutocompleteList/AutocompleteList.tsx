"use client";
import { LoaderCircle } from "lucide-react";

import { cn } from "@/shared/lib/util/cn";

interface AutocompleteListProps {
  id: string;
  items: string[];
  query: string;
  /** 검색 결과를 기다리는 중 */
  isLoading?: boolean;
  onSelect: (value: string) => void;
}

// 입력한 글자와 일치하는 부분을 강조
function HighlightedText({ text, query }: { text: string; query: string }) {
  const trimmedQuery = query.trim();
  const index = text.toLowerCase().indexOf(trimmedQuery.toLowerCase());
  if (!trimmedQuery || index < 0) return <>{text}</>;

  return (
    <>
      {text.slice(0, index)}
      <strong className="text-primary font-semibold">
        {text.slice(index, index + trimmedQuery.length)}
      </strong>
      {text.slice(index + trimmedQuery.length)}
    </>
  );
}

function AutocompleteList({
  id,
  items,
  query,
  isLoading = false,
  onSelect,
}: AutocompleteListProps) {
  const hasItems = items.length > 0;

  return (
    <ul
      id={id}
      role="listbox"
      aria-busy={isLoading}
      className="ring-light absolute inset-x-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-md bg-white py-1 shadow-lg ring-1"
    >
      {/* 이전 결과가 없을 때만 로딩 문구를 보여주고, 있으면 결과를 흐리게 유지 */}
      {!hasItems && isLoading && (
        <li className="text-dark flex items-center gap-2 px-4 py-2.5 text-sm">
          <LoaderCircle className="size-4 animate-spin" aria-hidden />
          검색 중
        </li>
      )}
      {hasItems && isLoading && (
        <li className="pointer-events-none absolute top-3 right-3">
          <LoaderCircle
            className="stroke-dark size-4 animate-spin"
            aria-label="검색 중"
          />
        </li>
      )}
      {items.map((item) => (
        <li
          key={item}
          role="option"
          aria-selected={false}
          className={cn("transition-opacity", isLoading && "opacity-50")}
        >
          <button
            type="button"
            // 입력칸 포커스가 빠지면 목록이 닫히므로, 누르는 동안 포커스 유지
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onSelect(item)}
            className="hover:bg-light w-full cursor-pointer px-4 py-2.5 text-left text-base"
          >
            <HighlightedText text={item} query={query} />
          </button>
        </li>
      ))}
    </ul>
  );
}

export default AutocompleteList;
