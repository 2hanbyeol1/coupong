import { CouponListWidget } from "@/widgets/coupon/ui/CouponListWidget";

function HomePage() {
  // 지난 쿠폰처럼 긴 목록에서도 바로 탭을 바꿀 수 있게 탭을 고정
  return <CouponListWidget stickyTabs />;
}

export default HomePage;
