import { LoginButton } from "@/entities/auth/ui";
import { Logo } from "@/shared/ui";

function LoginWidget() {
  return (
    <div className="flex flex-col items-center gap-10">
      <div className="flex flex-col items-center gap-4">
        <Logo size={76} />

        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">쿠퐁</h1>
          <p className="text-dark text-base tracking-tight">
            우리 가족 쿠폰 모두 여기로
          </p>
        </div>
      </div>

      <LoginButton />
    </div>
  );
}

export default LoginWidget;
