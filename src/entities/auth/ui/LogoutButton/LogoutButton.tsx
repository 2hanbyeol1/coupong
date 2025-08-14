"use client";

import { useRouter } from "next/navigation";

import { signOut } from "@/entities/auth/api/auth";
import { ROUTES } from "@/shared/config/routes";
import useToast from "@/shared/lib/hook/useToast";

function LogoutButton() {
  const { addToast } = useToast();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push(ROUTES.LOGIN);
    } catch (error) {
      addToast({
        message:
          error instanceof Error
            ? error.message
            : "로그아웃 중 오류가 발생했어요",
        type: "error",
        duration: 3000,
      });
    }
  };

  // ! 임시 로그아웃 버튼
  return (
    <button
      type="button"
      className="text-primary text-base font-semibold disabled:cursor-not-allowed disabled:opacity-50"
      onClick={handleLogout}
    >
      로그아웃
    </button>
  );
}

export default LogoutButton;
