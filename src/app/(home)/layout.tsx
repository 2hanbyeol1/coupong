import { ReactNode } from "react";

import { AddCouponButton } from "@/entities/coupon/ui/AddCouponButton";
import { Header } from "@/widgets/header";

function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <Header title="쿠폰함" withOrganizationButton withSearchButton />
      {children}
      <AddCouponButton />
    </div>
  );
}

export default HomeLayout;
