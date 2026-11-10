import { CouponType } from "../api/type";

/** 쿠폰 사용처(place)나 이름(name)에 키워드가 포함된 쿠폰만 남긴다. (대소문자 무시) */
export const filterCouponsByKeyword = <T extends CouponType>(
  coupons: T[],
  keyword?: string,
) => {
  if (!keyword) return coupons;

  const upperKeyword = keyword.toUpperCase();
  return coupons.filter(
    (coupon) =>
      coupon.place.toUpperCase().includes(upperKeyword) ||
      coupon.name.toUpperCase().includes(upperKeyword),
  );
};
