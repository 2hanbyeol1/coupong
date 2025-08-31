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
            쿠폰 한곳에서 관리하기
          </p>
        </div>
      </div>

      <LoginButton />
    </div>
  );
}

export default LoginWidget;
