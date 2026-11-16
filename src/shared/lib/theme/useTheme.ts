"use client";
import { useCallback, useEffect, useSyncExternalStore } from "react";

import {
  applyTheme,
  getStoredTheme,
  storeTheme,
  subscribeSystemTheme,
  Theme,
} from "./theme";

// 같은 탭 안에서 테마를 바꿨을 때 다른 구독자에게 알림
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  // 다른 탭에서 바꾼 경우
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
};

/** 고른 테마(시스템·라이트·다크)와 바꾸는 함수 */
function useTheme() {
  const theme = useSyncExternalStore<Theme>(
    subscribe,
    getStoredTheme,
    () => "system",
  );

  const setTheme = useCallback((next: Theme) => {
    storeTheme(next);
    applyTheme(next);
    listeners.forEach((listener) => listener());
  }, []);

  return { theme, setTheme };
}

/** 앱 전체에서 한 번: 기기 설정이나 다른 탭의 변경을 화면에 반영 */
export function useThemeSync() {
  const { theme } = useTheme();

  useEffect(() => {
    applyTheme(theme);
    if (theme !== "system") return;
    return subscribeSystemTheme(() => applyTheme("system"));
  }, [theme]);
}

export default useTheme;
