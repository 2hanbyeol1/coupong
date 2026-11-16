"use client";
import { useThemeSync } from "@/shared/lib/theme/useTheme";

/** 기기 설정이나 다른 탭에서 바꾼 테마를 화면에 반영 (화면에는 아무것도 그리지 않음) */
function ThemeSync() {
  useThemeSync();
  return null;
}

export default ThemeSync;
