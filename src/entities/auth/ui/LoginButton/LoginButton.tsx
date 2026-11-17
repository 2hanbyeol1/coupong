"use client";
import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";

import useToast from "@/shared/lib/hook/useToast";

import { signInWithKakaoOption } from "../../api/query";

function LoginButton() {
  const { addToast } = useToast();
  const isLockedRef = useRef(false);

  const { mutate: signInWithKakao, isPending: isSigningIn } = useMutation({
    ...signInWithKakaoOption(),
    onError: () => {
      addToast({
        message: "로그인에 실패했어요",
      });
    },
    onSettled: () => {
      isLockedRef.current = false;
    },
  });

  const handleClick = () => {
    if (isLockedRef.current) return;
    isLockedRef.current = true;
    signInWithKakao();
  };

  // 카카오 로그인 디자인 가이드: 노란 바탕(#FEE500), 85% 검정 글자, 말풍선 심볼
  return (
    <button
      type="button"
      className="flex h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#FEE500] text-base font-semibold text-black/85 transition-[filter] active:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
      onClick={handleClick}
      disabled={isSigningIn}
    >
      <KakaoSymbol />
      {isSigningIn ? "카카오로 이동 중…" : "카카오로 시작하기"}
    </button>
  );
}

function KakaoSymbol() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 18 18"
      className="size-[18px] shrink-0"
      fill="currentColor"
    >
      <path d="M9 1.5C4.58 1.5 1 4.32 1 7.8c0 2.24 1.49 4.21 3.73 5.33-.16.6-.6 2.15-.69 2.48-.11.41.15.4.32.29.13-.09 2.04-1.39 2.87-1.95.57.08 1.17.13 1.77.13 4.42 0 8-2.82 8-6.3S13.42 1.5 9 1.5Z" />
    </svg>
  );
}

export default LoginButton;
