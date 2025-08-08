import { ROUTES } from "@/shared/config";
import { CenteredView, Logo } from "@/shared/ui";

export function HomeWidget() {
  return (
    <CenteredView className="max-w-52 gap-9">
      <div className="flex flex-col items-center gap-5">
        <Logo size={76} />
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">쿠퐁</h1>
          <p className="text-secondary text-base tracking-tight">
            우리 가족 쿠폰 모두 여기로
          </p>
        </div>
      </div>
      <a href={ROUTES.LOGIN} className="text-primary text-base font-bold">
        시작하기
      </a>
    </CenteredView>
  );
}
