import { NextRequest, NextResponse } from "next/server";

import { ROUTES } from "@/shared/config/routes";
import createClient from "@/shared/lib/supabase/server";

function redirectToLoginWithError(request: NextRequest, reason: string) {
  const url = new URL(ROUTES.LOGIN, request.nextUrl.origin);
  url.searchParams.set("auth_error", reason);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const providerError = searchParams.get("error");
  if (providerError) {
    console.error(
      `OAuth provider error: ${providerError} - ${searchParams.get("error_description") ?? ""}`,
    );
    return redirectToLoginWithError(request, "provider");
  }

  const code = searchParams.get("code");
  if (!code) return redirectToLoginWithError(request, "missing_code");

  const supabase = await createClient();
  const { error: exchangeCodeError } =
    await supabase.auth.exchangeCodeForSession(code);
  if (exchangeCodeError) {
    console.error(`exchangeCodeForSession 실패: ${exchangeCodeError.message}`);
    const reason = exchangeCodeError.message
      .toLowerCase()
      .includes("code verifier")
      ? "verifier_missing"
      : "exchange_failed";
    return redirectToLoginWithError(request, reason);
  }

  // 첫 가입 시 트리거(on_auth_user_created)가 public.users에 행을 자동 생성.

  return NextResponse.redirect(new URL(ROUTES.HOME, request.nextUrl.origin));
}
