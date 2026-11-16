import { ComponentProps } from "react";
import { Search, X } from "lucide-react";

import { cn } from "@/shared/lib/util/cn";

interface SearchInputProps extends ComponentProps<"input"> {
  className?: string;
  onXButtonClick?: () => void;
}

/** 위·아래 테두리에 비치는 무지갯빛 하이라이트 */
const IRIDESCENT_RIM =
  "bg-[linear-gradient(90deg,transparent,rgb(244_198_230/0.9)_25%,rgb(170_240_140/1)_50%,rgb(244_198_230/0.9)_75%,transparent)]";

/** 뒤의 콘텐츠가 흐리게 비치는 반투명(글래스) 검색창 */
function SearchInput({
  className,
  onXButtonClick,
  ...props
}: SearchInputProps) {
  return (
    <div
      className={cn(
        "group relative flex items-center rounded-full",
        // 옅은 흰빛(위가 조금 더 밝게) + 뒤 콘텐츠를 살짝만 블러해 형태가 비치게
        "bg-linear-to-b from-white/30 to-white/10 backdrop-blur-md backdrop-saturate-[1.4]",
        // 유리 가장자리: 흰 테두리, 위쪽 하이라이트, 아래쪽 안쪽 빛, 흰 배경에서도 보이는 외곽선·그림자
        "border border-white/70 ring-1 ring-black/[0.07]",
        "shadow-[inset_0_1px_1px_rgb(255_255_255/0.9),inset_0_-10px_16px_-10px_rgb(255_255_255/0.8),0_4px_12px_-6px_rgb(0_0_0/0.1)]",
        "transition-[box-shadow,background-color] duration-200",
        "focus-within:from-white/45 focus-within:to-white/20",
        // 다크 모드: 흰빛을 줄여 어두운 유리처럼
        "dark:border-white/15 dark:from-white/12 dark:to-white/4 dark:ring-white/5 dark:focus-within:from-white/18 dark:focus-within:to-white/8",
        "dark:shadow-[inset_0_1px_1px_rgb(255_255_255/0.12),0_4px_12px_-6px_rgb(0_0_0/0.6)]",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-8 -top-px h-px opacity-70 transition-opacity duration-200 group-focus-within:opacity-100",
          IRIDESCENT_RIM,
        )}
      />
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-16 -bottom-px h-px opacity-50 transition-opacity duration-200 group-focus-within:opacity-90",
          IRIDESCENT_RIM,
        )}
      />

      <Search
        aria-hidden
        className="group-focus-within:stroke-primary stroke-dark pointer-events-none absolute left-4 size-4 stroke-[2.5] transition-colors duration-200"
      />
      <input
        type="search"
        className="placeholder:text-dark w-full appearance-none bg-transparent py-2.5 pr-11 pl-11 [&::-webkit-search-cancel-button]:hidden"
        {...props}
      />
      {props.value && (
        <button
          type="button"
          aria-label="검색어 지우기"
          // 누르는 영역은 32px로 유지하고, 보이는 원만 작고 옅게
          className="group/clear absolute right-1.5 flex size-8 cursor-pointer items-center justify-center"
          onClick={onXButtonClick}
        >
          <span className="bg-dark/50 group-hover/clear:bg-dark/70 flex size-5.5 items-center justify-center rounded-full transition-colors">
            <X className="size-3 stroke-white stroke-3" />
          </span>
        </button>
      )}
    </div>
  );
}

export default SearchInput;
