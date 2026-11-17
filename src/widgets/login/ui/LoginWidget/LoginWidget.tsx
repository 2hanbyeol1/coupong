import { LoginButton } from "@/entities/auth/ui";
import { Logo } from "@/shared/ui";

import CouponPreview from "./CouponPreview";

function LoginWidget() {
  return (
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col px-6">
      <div className="flex flex-1 flex-col items-center justify-center gap-8 py-8">
        <div className="flex flex-col items-center gap-4">
          <Logo size={72} />

          <div className="flex flex-col items-center gap-1.5 text-center">
            <h1 className="text-[28px] font-bold tracking-tight">쿠퐁</h1>
            <p className="text-dark text-base tracking-tight">
              가족·친구와 쿠폰을 한곳에 모으고
              <br />
              함께 나눠 써요
            </p>
          </div>
        </div>

        <div className="w-full max-w-72">
          <CouponPreview />
        </div>
      </div>

      <div className="pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <LoginButton />
      </div>
    </div>
  );
}

export default LoginWidget;
