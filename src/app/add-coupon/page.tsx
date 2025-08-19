import { AddCouponFunnel } from "@/features/add-coupon";
import { Header } from "@/widgets/header";

function AddCouponPage() {
  return (
    <div className="relative">
      <Header title="쿠폰 등록" withBackButton withOrganizationButton />

      <AddCouponFunnel />
    </div>
  );
}

export default AddCouponPage;
