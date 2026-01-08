import { ReactNode } from "react";

import { CenteredView } from "@/shared/ui/CenteredView";
import { Header } from "@/widgets/header";

function CouponDetailLayout({ children }: { children: ReactNode }) {
  return (
    <CenteredView className="relative">
      <Header withBackButton withOrganizationButton />
      {children}
    </CenteredView>
  );
}

export default CouponDetailLayout;
