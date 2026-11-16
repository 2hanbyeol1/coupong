export const THEMES = ["system", "light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_STORAGE_KEY = "theme";

/** 브라우저 상단바(PWA 상태 표시줄) 색 (globals.css의 --color-surface와 같게) */
export const THEME_COLOR = { light: "#ffffff", dark: "#141414" } as const;

const isTheme = (value: unknown): value is Theme =>
  THEMES.includes(value as Theme);

export function getStoredTheme(): Theme {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(value) ? value : "system";
  } catch {
    return "system";
  }
}

export function storeTheme(theme: Theme) {
  try {
    if (theme === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // 저장할 수 없으면(사생활 보호 모드 등) 이번 방문 동안만 적용
  }
}

const systemDarkQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

/** 고른 테마를 화면에 적용 (system이면 기기 설정을 따름) */
export function applyTheme(theme: Theme) {
  const isDark =
    theme === "dark" || (theme === "system" && systemDarkQuery().matches);
  document.documentElement.classList.toggle("dark", isDark);
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((meta) =>
      meta.setAttribute(
        "content",
        isDark ? THEME_COLOR.dark : THEME_COLOR.light,
      ),
    );
}

/** 기기 설정이 바뀔 때 호출 (해제 함수 반환) */
export function subscribeSystemTheme(onChange: () => void) {
  const query = systemDarkQuery();
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * 첫 화면을 그리기 전에 테마를 적용하는 스크립트 (<head>에 인라인으로 넣음)
 * React가 뜬 뒤에 적용하면 흰 화면이 잠깐 번쩍이므로 미리 실행
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;
