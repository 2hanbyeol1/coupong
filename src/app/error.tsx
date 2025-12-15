"use client";

import { useRouter } from "next/navigation";

import { Logo } from "@/shared/ui";
import { CenteredView } from "@/shared/ui/CenteredView";

function ErrorPage({ error }: { error: Error }) {
  const router = useRouter();

  return (
    <CenteredView className="max-w-60">
      <div className="flex flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-4">
          <Logo size={76} />

          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">쿠퐁</h1>
            <p className="text-dark text-center text-base tracking-tight">
              {error.message ?? "에러가 발생했습니다"}
            </p>
          </div>
        </div>

        <button
          className="text-primary font-medium"
          onClick={() => router.back()}
        >
          뒤로가기
        </button>
      </div>
    </CenteredView>
  );
}

export default ErrorPage;
