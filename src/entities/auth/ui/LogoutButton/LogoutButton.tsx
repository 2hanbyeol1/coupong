"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { ROUTES } from "@/shared/config/routes";
import useToast from "@/shared/lib/hook/useToast";
import { cn } from "@/shared/lib/util/cn";

import { signOutOption } from "../../api/query";

interface LogoutButtonProps {
  className?: string;
}
function LogoutButton({ className }: LogoutButtonProps) {
  const { addToast } = useToast();
  const router = useRouter();
  const { mutate: signOut } = useMutation({
    ...signOutOption(),
    onSuccess: () => {
      router.push(ROUTES.LOGIN);
    },
    onError: () => {
      addToast({
        message: "로그아웃 중 오류가 발생했어요",
        type: "error",
      });
    },
  });

  return (
    <button
      type="button"
      className={cn(
        "text-primary cursor-pointer text-base font-semibold disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      onClick={() => signOut()}
    >
      로그아웃
    </button>
  );
}

export default LogoutButton;
