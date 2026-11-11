/**
 * 날짜가 유효 기간을 초과했는지 체크, 시간은 무시합니다.
 * @param expireDate 만료되는 날짜
 * @returns 유효 기간이 지났는지 여부
 */
export const getExpired = (expireDate: string) => {
  const today = new Date();
  const date = new Date(expireDate);

  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const dayOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  return dayOnly < todayOnly;
};

/**
 * 생성일로부터 일주일이 지났는지 체크
 * @param createdAt 생성일
 * @returns 일주일이 지났는지 여부
 */
export const isWeekPassed = (createdAt: string) => {
  const today = new Date();
  const createdDate = new Date(createdAt);
  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  return createdDate < oneWeekAgo;
};

export const getYYYYMMDD = (date: string) => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

/**
 * 날짜를 date input 값 형식(YYYY-MM-DD, 로컬 시간 기준)으로 반환
 */
export const toDateInputValue = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

/**
 * 오늘 날짜를 date input 값 형식(YYYY-MM-DD, 로컬 시간 기준)으로 반환
 */
export const getTodayDateInputValue = () => toDateInputValue(new Date());

/**
 * YYYY-MM-DD 값을 로컬 시간 기준 Date로 변환. 형식이 틀리거나 없는 날짜(2월 30일 등)면 null
 */
export const parseDateInputValue = (value: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, year, month, day] = match.map(Number);
  const date = new Date(year, month - 1, day);
  const isValid =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;
  return isValid ? date : null;
};
