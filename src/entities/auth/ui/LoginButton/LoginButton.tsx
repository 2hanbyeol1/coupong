"use client";
import { signInWithKakao } from "@/entities/auth/api/auth";
import useToast from "@/shared/lib/hook/useToast";

function LoginButton() {
  const { addToast } = useToast();

  const handleLogin = async () => {
    try {
      await signInWithKakao();
    } catch (error) {
      addToast({
        message:
          error instanceof Error
            ? error.message
            : "알 수 없는 에러가 발생했어요",
        type: "error",
        duration: 5000,
      });
    }
  };

  return (
    <button
      type="button"
      className="text-primary cursor-pointer text-base font-bold disabled:cursor-not-allowed disabled:opacity-50"
      onClick={handleLogin}
    >
      카카오로 시작하기
    </button>
  );
}

export default LoginButton;
