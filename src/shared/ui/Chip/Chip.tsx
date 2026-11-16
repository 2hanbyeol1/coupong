import { ComponentProps } from "react";
import { cva, VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/util/cn";

/**
 * color
 * - muted: 옅은 회색 (선택되지 않은 항목, 추천 값)
 * - neutral: 회색 (선택된 항목)
 * - primary: 브랜드 색 (현재 위치 강조)
 * - overlay: 반투명 검정 (사진 위에 얹을 때)
 * - white: 흰색 (흐리게 처리한 사진 위에 얹을 때)
 *
 * size
 * - sm (20px): 개수·순번·상태 라벨
 * - md (28px): 눌러서 고르는 추천 값
 *
 * 버튼처럼 눌러야 하면 chipVariants를 버튼 className에 쓰기
 */
export const chipVariants = cva(
  "flex shrink-0 items-center justify-center rounded-full whitespace-nowrap tabular-nums transition-colors duration-200",
  {
    variants: {
      color: {
        muted: "bg-black/5 text-black/40",
        neutral: "bg-black/8 text-black/70",
        primary: "bg-primary text-white",
        overlay: "bg-black/50 text-white",
        white: "bg-white text-black",
      },
      size: {
        sm: "h-5 min-w-5 px-1.5 text-xs font-medium",
        md: "h-7 min-w-7 px-3 text-sm",
      },
    },
    defaultVariants: {
      color: "muted",
      size: "sm",
    },
  },
);

type ChipProps = VariantProps<typeof chipVariants> & ComponentProps<"span">;

/** 개수·순번·상태 같은 짧은 값을 담는 칩 (한 글자면 동그라미, 길어지면 옆으로 늘어남) */
function Chip({ color, size, className, ...props }: ChipProps) {
  return (
    <span className={cn(chipVariants({ color, size }), className)} {...props} />
  );
}

export default Chip;
