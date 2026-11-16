/**
 * 현재 URL의 검색 파라미터 일부만 바꿈 (값이 비어 있으면 삭제, 나머지 파라미터는 유지)
 * 값이 바뀔 때마다 기록이 쌓이지 않도록 현재 기록을 교체
 */
export const replaceSearchParams = (
  updates: Record<string, string | undefined>,
) => {
  const url = new URL(window.location.href);
  Object.entries(updates).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  });

  if (url.href !== window.location.href) {
    window.history.replaceState(null, "", url);
  }
};
