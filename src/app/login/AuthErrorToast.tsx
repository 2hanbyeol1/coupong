"use client";

import { useEffect } from "react";

import useToast from "@/shared/lib/hook/useToast";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  provider: "카카오 로그인이 취소되었어요.\n다시 시도해 주세요.",
  missing_code: "로그인 정보가 누락되었어요.\n다시 시도해 주세요.",
  verifier_missing:
    "로그인 세션이 만료되었어요.\n같은 브라우저에서 다시 시도해 주세요.",
  exchange_failed: "로그인에 실패했어요.\n잠시 후 다시 시도해 주세요.",
  user_insert_failed: "사용자 정보 생성에 실패했어요.\n다시 시도해 주세요.",
};

function AuthErrorToast({ reason }: { reason: string }) {
  const { addToast } = useToast();

  useEffect(() => {
    addToast({
      message: AUTH_ERROR_MESSAGES[reason] ?? "로그인에 실패했어요",
    });
  }, [reason, addToast]);

  return null;
}

export default AuthErrorToast;
