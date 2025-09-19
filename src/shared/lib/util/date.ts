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
