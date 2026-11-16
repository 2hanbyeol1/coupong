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

/**
 * YYYY-MM-DD 값을 "2027년 8월 18일"처럼 앞의 0 없이 표시. 날짜가 아니면 그대로 반환
 */
export const formatKoreanDate = (value: string) => {
  const date = parseDateInputValue(value);
  if (!date) return value;
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/** 시간을 버리고 날짜(로컬 자정)만 남김 */
const toDateOnly = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

/**
 * 오늘부터 만료일까지 남은 날 수, 시간은 무시합니다.
 * @returns 오늘이 만료일이면 0, 이미 지났으면 음수
 */
export const getDaysLeft = (expireDate: string) => {
  const today = toDateOnly(new Date());
  const date = toDateOnly(new Date(expireDate));
  // 서머타임 등으로 하루가 24시간이 아닐 때도 정확하도록 반올림
  return Math.round((date.getTime() - today.getTime()) / ONE_DAY_MS);
};

/**
 * "12월 5일"처럼 짧게 표시. 올해가 아니면 "2027년 8월 5일"
 */
export const formatShortDate = (value: string) => {
  const date = new Date(value);
  const monthDay = `${date.getMonth() + 1}월 ${date.getDate()}일`;
  return date.getFullYear() === new Date().getFullYear()
    ? monthDay
    : `${date.getFullYear()}년 ${monthDay}`;
};

/**
 * 남은 날 수를 읽기 쉬운 말로 표시
 * 0일: "오늘까지" / 30일 미만: "19일 남음" / 1년 미만: "1달 남음" / 그 이상: "1년 남음"
 * (달·년은 실제보다 여유 있어 보이지 않게 내림.
 *  단, "12달 남음"은 어색하므로 360일부터는 "1년 남음")
 */
export const formatDaysLeft = (daysLeft: number) => {
  if (daysLeft <= 0) return "오늘까지";
  if (daysLeft < 30) return `${daysLeft}일 남음`;
  if (daysLeft < 360) return `${Math.floor(daysLeft / 30)}달 남음`;
  return `${Math.max(1, Math.floor(daysLeft / 365))}년 남음`;
};
