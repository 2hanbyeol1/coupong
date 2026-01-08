/**
 * 라우트 경로 상수 정의
 */

export const ROUTES = {
  HOME: "/", // 홈
  LOGIN: "/login", // 로그인
  ADD_COUPON: "/coupon/add", // 쿠폰 등록
  COUPON_DETAIL: (id: string) => `/coupon/${id}`, // 쿠폰 상세
  SEARCH: "/search", // 검색
  PROFILE: "/profile", // 프로필
} as const;
