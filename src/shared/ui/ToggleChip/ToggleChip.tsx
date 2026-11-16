"use client";
import { ComponentProps } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";

import { cn } from "@/shared/lib/util/cn";

interface ToggleChipProps
  extends Omit<ComponentProps<"button">, "onChange" | "type"> {
  pressed: boolean;
  onChange: (pressed: boolean) => void;
}

const CHECK_TRANSITION = { duration: 0.2, ease: "easeOut" } as const;

/**
 * 눌러서 켜고 끄는 작은 칩
 * 켜지면 체크 표시가 왼쪽에서 펼쳐지며 나타나고 색이 바뀜, 누르는 동안 살짝 줄어듦
 */
function ToggleChip({
  pressed,
  onChange,
  className,
  children,
  ...props
}: ToggleChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => onChange(!pressed)}
      className={cn(
        "flex h-7 shrink-0 cursor-pointer items-center rounded-full border px-2.5 text-xs transition-[color,background-color,border-color,transform] duration-200 active:scale-95",
        pressed
          ? "border-primary bg-primary/10 text-primary font-semibold"
          : "border-light text-dark",
        className,
      )}
      {...props}
    >
      {/* 체크 표시 자리가 넓어지며 나타나, 글자가 밀리는 것도 부드럽게 보임 */}
      <AnimatePresence initial={false}>
        {pressed && (
          <motion.span
            key="check"
            aria-hidden
            initial={{ width: 0, marginRight: 0, opacity: 0, scale: 0.5 }}
            animate={{ width: 12, marginRight: 4, opacity: 1, scale: 1 }}
            exit={{ width: 0, marginRight: 0, opacity: 0, scale: 0.5 }}
            transition={CHECK_TRANSITION}
            className="flex shrink-0 items-center overflow-hidden"
          >
            <Check size={12} strokeWidth={3} className="shrink-0" />
          </motion.span>
        )}
      </AnimatePresence>
      {children}
    </button>
  );
}

export default ToggleChip;
