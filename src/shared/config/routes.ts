/**
 * 라우트 경로 상수 정의
 */

export const ROUTES = {
  HOME: "/", // 홈
  LOGIN: "/login", // 로그인
  ADD_COUPON: "/coupon/add", // 쿠폰 등록
  COUPON_DETAIL: (id: string, keyword?: string) =>
    keyword
      ? `/coupon/${id}?keyword=${encodeURIComponent(keyword)}`
      : `/coupon/${id}`, // 쿠폰 상세 (keyword: 검색 결과 안에서만 스와이프)
  SEARCH: (keyword?: string) =>
    keyword ? `/search?keyword=${encodeURIComponent(keyword)}` : "/search", // 검색 (keyword: 검색어 유지)
  PROFILE: "/profile", // 프로필
  PROFILE_ORGANIZATION: "/profile/organization", // 내 그룹 관리
  PROFILE_ORGANIZATION_MEMBER: (organizationId: string) =>
    `/profile/organization/${organizationId}`, // 그룹원 관리
  PROFILE_NOTIFICATION: "/profile/notification", // 알림 관리
} as const;
