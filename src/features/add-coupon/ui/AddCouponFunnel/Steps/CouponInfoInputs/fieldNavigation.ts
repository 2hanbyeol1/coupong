/** 입력칸과 날짜 입력칸(누르면 시트가 열리는 버튼) */
const FIELD_SELECTOR =
  "input:not([type='hidden']):not([type='checkbox']), button[aria-haspopup='dialog']";

/**
 * container 안에서 current 다음 입력칸
 * 날짜 입력칸이면 포커스만 옮기고, 비어 있으면 달력 시트를 엶
 * 다음 칸이 없으면 false
 */
export function focusNextField(
  current: HTMLElement,
  container: HTMLElement,
): boolean {
  // 자리만 남기고 숨긴 칸(inert)은 건너뜀
  const fields = Array.from(
    container.querySelectorAll<HTMLElement>(FIELD_SELECTOR),
  ).filter((field) => field === current || !field.closest("[inert]"));
  const next = fields[fields.indexOf(current) + 1];
  if (!next) return false;

  next.focus();
  if (next instanceof HTMLButtonElement && next.dataset.empty === "true") {
    next.click();
  }
  return true;
}
