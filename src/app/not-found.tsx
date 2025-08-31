import Link from "next/link";

import { ROUTES } from "@/shared/config/routes";
import { Logo } from "@/shared/ui";
import { CenteredView } from "@/shared/ui/CenteredView";

function NotFoundPage() {
  return (
    <CenteredView className="max-w-60">
      <div className="flex flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-4">
          <Logo size={76} />

          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              없는 주소 입니다
            </h1>
            <p className="text-dark text-base tracking-tight">
              주소를 다시 한 번 확인해주세요
            </p>
          </div>
        </div>

        <Link href={ROUTES.HOME} className="text-primary font-medium">
          홈으로 돌아가기
        </Link>
      </div>
    </CenteredView>
  );
}

export default NotFoundPage;
