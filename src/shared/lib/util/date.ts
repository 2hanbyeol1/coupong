/**
 * 날짜가 유효 기간을 초과했는지 체크
 * @param date 날짜
 * @returns 유효 기간이 지났는지 여부
 */
export const getExpired = (date: string) => {
  const today = new Date();
  const couponDate = new Date(date);
  return couponDate < today;
};
