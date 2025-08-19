import { LogoutButton } from "@/entities/auth/ui";
import { AddCouponButton } from "@/entities/coupon/ui/AddCouponButton";
import { CouponListWidget } from "@/widgets/coupon/ui/CouponListWidget";
import Header from "@/widgets/header/Header";

function HomePage() {
  return (
    <div className="relative">
      <Header title="쿠폰함" withOrganizationButton withSearchButton />

      <CouponListWidget />

      <AddCouponButton />

      <div className="flex justify-center pb-10">
        <LogoutButton />
      </div>
    </div>
  );
}

export default HomePage;
