import { parseDateInputValue } from "@/shared/lib/util/date";

/** 앞의 0을 뗀 월·일 (08 → 8) */
export const trimLeadingZero = (value: string) =>
  value ? String(Number(value)) : "";

/** "2026년 8월 1일" 모양으로 표시 (YYYYMMDD 숫자) */
export const formatDateDigits = (digits: string) =>
  `${digits.slice(0, 4)}년 ${trimLeadingZero(digits.slice(4, 6))}월 ${trimLeadingZero(digits.slice(6, 8))}일`;

/** YYYY-MM-DD → YYYYMMDD, 날짜가 아니면 빈 문자열 */
export const toDateDigits = (value: string) =>
  parseDateInputValue(value) ? value.replace(/-/g, "") : "";

/** 그 달의 마지막 날짜, 연·월을 다 입력하지 않았으면 31 */
export const getLastDayOfMonth = (year: string, month: string) =>
  year.length === 4 && Number(month) > 0
    ? new Date(Number(year), Number(month), 0).getDate()
    : 31;

/**
 * 월 칸에 친 값 정리
 * - 2~9 또는 1.처럼 끊어 치면 한 자리로 확정 (3, 1.)
 * - 13 이상이면 앞 숫자를 월로 확정하고 뒤 숫자는 일로 넘김 (15 → 1월 5)
 * - 00은 무시
 */
export const parseMonthInput = (
  raw: string,
): { month: string; isDone: boolean; carry?: string } => {
  const digits = raw.replace(/\D/g, "").slice(0, 2);
  const hasSeparator = /\D/.test(raw);

  if (digits.length === 1) {
    const isDone = (hasSeparator && digits !== "0") || Number(digits) > 1;
    return { month: digits, isDone };
  }
  if (digits.length === 2) {
    const month = Number(digits);
    if (month === 0) return { month: "0", isDone: false };
    if (month > 12) {
      return { month: digits[0], isDone: true, carry: digits[1] };
    }
    // 01처럼 0을 붙여 쳐도 1로 보여줌
    return { month: trimLeadingZero(digits), isDone: true };
  }
  return { month: "", isDone: false };
};

/**
 * 일 칸에 친 값 정리
 * - 그 달에 올 수 없는 첫 숫자거나 끊어 치면 한 자리로 확정 (4, 2월의 3)
 * - 00이나 그 달에 없는 날짜가 되는 숫자는 무시
 */
export const parseDayInput = (
  raw: string,
  lastDay: number,
): { day: string; isDone: boolean } => {
  const digits = raw.replace(/\D/g, "").slice(0, 2);
  const hasSeparator = /\D/.test(raw);

  if (digits.length === 1) {
    const isDone =
      (hasSeparator && digits !== "0") ||
      Number(digits) > Math.floor(lastDay / 10);
    return { day: digits, isDone };
  }
  if (digits.length === 2) {
    const day = Number(digits);
    if (day === 0 || day > lastDay) return { day: digits[0], isDone: false };
    return { day: trimLeadingZero(digits), isDone: true };
  }
  return { day: "", isDone: false };
};

/**
 * 2027.1.2, 2027-01-02, 20270102처럼 한 번에 붙여넣은 날짜를 연·월·일로 나눔
 * 날짜로 읽을 수 없으면 null
 */
export const splitPastedDate = (raw: string) => {
  const parts = raw.split(/\D+/).filter(Boolean);
  if (parts.length === 3 && parts[0].length === 4) {
    const [year, month, day] = parts;
    if (month.length <= 2 && day.length <= 2) {
      return {
        year,
        month: trimLeadingZero(month),
        day: trimLeadingZero(day),
      };
    }
  }
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 8) {
    return {
      year: digits.slice(0, 4),
      month: trimLeadingZero(digits.slice(4, 6)),
      day: trimLeadingZero(digits.slice(6, 8)),
    };
  }
  return null;
};
