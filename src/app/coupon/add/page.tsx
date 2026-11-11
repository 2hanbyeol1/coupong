import { AddCouponFunnel } from "@/features/add-coupon";
import { SelectOrganizationField } from "@/features/select-organization/ui/SelectOrganizationField";
import { Header } from "@/widgets/header";

function AddCouponPage() {
  return (
    <div className="relative">
      <Header title="쿠폰 등록" withBackButton />

      <AddCouponFunnel organizationField={<SelectOrganizationField />} />
    </div>
  );
}

export default AddCouponPage;
