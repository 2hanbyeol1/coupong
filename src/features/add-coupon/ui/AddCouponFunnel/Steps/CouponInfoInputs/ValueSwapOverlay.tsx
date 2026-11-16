"use client";
import { RefObject, useLayoutEffect, useState } from "react";
import { motion } from "framer-motion";

import { cn } from "@/shared/lib/util/cn";

export interface SwapText {
  text: string;
  /** 값이 없어 안내 문구(placeholder)를 보여주는 중 */
  isPlaceholder: boolean;
}

interface ValueSwapOverlayProps {
  containerRef: RefObject<HTMLElement | null>;
  /** 입력칸 순서대로 바뀌기 전·후 글자 */
  items: { from: SwapText; to: SwapText }[];
  onDone: () => void;
}

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** 값 글자가 있는 칸: 입력칸, 그리고 누르면 달력이 열리는 날짜 칸 */
const FIELD_SELECTOR = "input:not([type='checkbox']), [aria-haspopup='dialog']";

const SWAP_TRANSITION = { duration: 0.32, ease: [0.22, 1, 0.36, 1] } as const;
/** 위 칸부터 조금씩 늦게 */
const SWAP_STAGGER = 0.04;

/**
 * 쿠폰이 바뀔 때 입력칸 위에 겹쳐, 이전 글자는 위로 빠지고 새 글자는 아래에서 올라오게 보여줌
 * 입력칸 자체는 움직이지 않고, 끝나면 사라져 실제 입력칸 글자가 같은 자리에 보임
 */
function ValueSwapOverlay({
  containerRef,
  items,
  onDone,
}: ValueSwapOverlayProps) {
  const [boxes, setBoxes] = useState<Box[]>([]);

  // 각 입력칸에서 글자가 그려지는 영역(안쪽 여백 제외)을 재서 그 위에 겹침
  useLayoutEffect(() => {
    const container = containerRef.current;
    const fields = container
      ? Array.from(container.querySelectorAll<HTMLElement>(FIELD_SELECTOR))
      : [];
    // 겹칠 칸을 못 찾으면 실제 글자가 숨겨진 채로 남지 않도록 바로 끝냄
    if (!container || fields.length === 0) {
      onDone();
      return;
    }
    const containerRect = container.getBoundingClientRect();
    setBoxes(
      fields.slice(0, items.length).map((field) => {
        const rect = field.getBoundingClientRect();
        const style = getComputedStyle(field);
        const paddingLeft = parseFloat(style.paddingLeft);
        const paddingRight = parseFloat(style.paddingRight);
        return {
          left: rect.left - containerRect.left + paddingLeft,
          top: rect.top - containerRect.top,
          width: rect.width - paddingLeft - paddingRight,
          height: rect.height,
        };
      }),
    );
    // 처음 그릴 때 한 번만 잼 (key로 바뀔 때마다 새로 그려짐)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (boxes.length === 0) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {boxes.map((box, index) => {
        const { from, to } = items[index];
        const delay = index * SWAP_STAGGER;
        const isLast = index === boxes.length - 1;
        return (
          <div key={index} className="absolute overflow-hidden" style={box}>
            <motion.span
              initial={{ y: "0%", opacity: 1 }}
              animate={{ y: "-100%", opacity: 0 }}
              transition={{ ...SWAP_TRANSITION, delay }}
              className={cn(
                "absolute inset-0 flex items-center truncate",
                from.isPlaceholder ? "text-black/30" : "text-black",
              )}
            >
              {from.text}
            </motion.span>
            <motion.span
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ ...SWAP_TRANSITION, delay }}
              onAnimationComplete={isLast ? onDone : undefined}
              className={cn(
                "absolute inset-0 flex items-center truncate",
                to.isPlaceholder ? "text-black/30" : "text-black",
              )}
            >
              {to.text}
            </motion.span>
          </div>
        );
      })}
    </div>
  );
}

export default ValueSwapOverlay;
