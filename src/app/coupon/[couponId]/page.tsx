import { CenteredView } from "@/shared/ui/CenteredView";
import CouponDetailWidget from "@/widgets/coupon/ui/CouponDetailWidget";
import { Header } from "@/widgets/header";

function CouponDetailPage() {
  return (
    <CenteredView className="relative">
      <Header title="" withBackButton withOrganizationButton />

      <CouponDetailWidget />
    </CenteredView>
  );
}

export default CouponDetailPage;
