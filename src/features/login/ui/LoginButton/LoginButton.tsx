"use client";
import { signInWithKakao } from "@/entities/auth/api/auth";

function LoginButton() {
  const handleLogin = async () => {
    try {
      await signInWithKakao();
    } catch (error) {
      console.log("로그인 오류", error);
    }
  };

  return (
    <button
      type="button"
      className="text-primary text-base font-bold disabled:cursor-not-allowed disabled:opacity-50"
      onClick={handleLogin}
    >
      카카오로 시작하기
    </button>
  );
}

export default LoginButton;
