/**
 * 라우트 경로 상수 정의
 */

export const ROUTES = {
  HOME: "/", // 홈
  LOGIN: "/login", // 로그인
  ADD_COUPON: "/add-coupon", // 쿠폰 등록
  COUPON_DETAIL: (id: string) => `/coupon/${id}`, // 쿠폰 상세
} as const;
