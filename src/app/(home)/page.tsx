import { LogoutButton } from "@/entities/auth/ui";
import { AddCouponButton } from "@/entities/coupon/ui/AddCouponButton";
import { Coupon } from "@/entities/coupon/ui/Coupon";
import Header from "@/widgets/header/Header";

function HomePage() {
  const coupons = [
    {
      id: "1",
      name: "CU_모바일 금액권 1천원권",
      date: "2025.09.02",
      isUsed: false,
    },
    {
      id: "2",
      name: "CU_모바일 금액권 1천원권",
      date: "2025.09.02",
      isUsed: false,
    },
    {
      id: "3",
      name: "CU_모바일 금액권 1천원권",
      date: "2025.09.02",
      isUsed: false,
    },
    {
      id: "4",
      name: "CU_모바일 금액권 1천원권",
      date: "2025.09.02",
      isUsed: false,
    },
    {
      id: "5",
      name: "CU_모바일 금액권 1천원권",
      date: "2025.09.02",
      isUsed: false,
    },
    {
      id: "6",
      name: "CU_모바일 금액권 1천원권",
      date: "2025.09.02",
      isUsed: false,
    },
    {
      id: "7",
      name: "CU_모바일 금액권 1천원권",
      date: "2025.09.02",
      isUsed: false,
    },
    {
      id: "8",
      name: "CU_모바일 금액권 1천원권",
      date: "2025.09.02",
      isUsed: false,
    },
    {
      id: "9",
      name: "CU_모바일 금액권 1천원권",
      date: "2025.09.02",
      isUsed: true,
    },
    {
      id: "10",
      name: "CU_모바일 금액권 1천원권",
      date: "2025.07.02",
      isUsed: false,
    },
  ];

  return (
    <div className="relative">
      <Header title="쿠폰함" />
      <div className="flex flex-col gap-2 px-3 pb-6">
        {coupons.map((coupon) => (
          <Coupon key={coupon.id} {...coupon} />
        ))}
      </div>

      <AddCouponButton />

      <div className="flex justify-center pb-10">
        <LogoutButton />
      </div>
    </div>
  );
}

export default HomePage;
