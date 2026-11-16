"use client";
import { useId } from "react";
import { motion } from "framer-motion";

import { Theme, THEMES, useTheme } from "@/shared/lib/theme";
import { cn } from "@/shared/lib/util/cn";

const THEME_LABEL: Record<Theme, string> = {
  system: "기기 설정",
  light: "라이트",
  dark: "다크",
};

/** 화면 테마(기기 설정·라이트·다크) 고르기 */
function ThemeSetting() {
  const { theme, setTheme } = useTheme();
  const labelId = useId();

  return (
    <div className="flex items-center justify-between gap-3 px-2 py-2">
      <span id={labelId} className="text-lg font-medium">
        화면 테마
      </span>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className="bg-light flex rounded-lg p-0.5"
      >
        {THEMES.map((option) => {
          const isSelected = option === theme;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setTheme(option)}
              className={cn(
                "relative h-8 cursor-pointer rounded-md px-3 text-sm transition-colors duration-200",
                isSelected ? "text-ink font-semibold" : "text-dark",
              )}
            >
              {/* 선택 표시가 고른 쪽으로 미끄러져 이동 */}
              {isSelected && (
                <motion.span
                  layoutId="theme-setting-indicator"
                  aria-hidden
                  className="bg-elevated absolute inset-0 rounded-md shadow-sm"
                />
              )}
              <span className="relative">{THEME_LABEL[option]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ThemeSetting;
