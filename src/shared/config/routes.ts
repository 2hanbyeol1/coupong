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
  PROFILE_ORGANIZATION: "/profile/organization", // 내 그룹 관리
  PROFILE_NOTIFICATION: "/profile/notification", // 알림 관리
} as const;
