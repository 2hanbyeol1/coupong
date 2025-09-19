"use client";
import { useMutation } from "@tanstack/react-query";

import useToast from "@/shared/lib/hook/useToast";

import { signInWithKakaoOption } from "../../api/query";

function LoginButton() {
  const { addToast } = useToast();
  const { mutate: signInWithKakao } = useMutation({
    ...signInWithKakaoOption(),
    onError: () => {
      addToast({
        message: "로그인에 실패했어요",
        type: "error",
      });
    },
  });

  return (
    <button
      type="button"
      className="text-primary cursor-pointer text-base font-bold disabled:cursor-not-allowed disabled:opacity-50"
      onClick={() => signInWithKakao()}
    >
      카카오로 시작하기
    </button>
  );
}

export default LoginButton;
