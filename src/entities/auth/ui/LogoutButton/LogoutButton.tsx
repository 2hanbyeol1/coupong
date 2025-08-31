"use client";

import { useRouter } from "next/navigation";

import { signOut } from "@/entities/auth/api/api";
import { ROUTES } from "@/shared/config/routes";
import useToast from "@/shared/lib/hook/useToast";
import { cn } from "@/shared/lib/util/cn";

interface LogoutButtonProps {
  className?: string;
}
function LogoutButton({ className }: LogoutButtonProps) {
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

  return (
    <button
      type="button"
      className={cn(
        "text-primary cursor-pointer text-base font-semibold disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      onClick={handleLogout}
    >
      로그아웃
    </button>
  );
}

export default LogoutButton;
