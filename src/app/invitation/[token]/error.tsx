"use client";
import Link from "next/link";

import { ROUTES } from "@/shared/config/routes";
import { Logo } from "@/shared/ui";
import { CenteredView } from "@/shared/ui/CenteredView";

function InvitationErrorPage({ error }: { error: Error }) {
  return (
    <CenteredView className="max-w-60">
      <div className="flex flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-4">
          <Logo size={76} />

          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              사용할 수 없는 초대장
            </h1>
            <p className="text-dark text-center text-base tracking-tight whitespace-pre-wrap">
              {error.message}
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

export default InvitationErrorPage;
