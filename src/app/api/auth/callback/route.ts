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
  const { data, error: exchangeCodeError } =
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

  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("user_id", data.user.id)
    .single();
  if (existingUser)
    return NextResponse.redirect(new URL(ROUTES.HOME, request.nextUrl.origin));

  const { error: insertError } = await supabase.from("users").insert({
    user_id: data.user.id,
    name: data.user.user_metadata?.name || data.user.email || "사용자",
  });
  if (insertError) {
    console.error(`사용자 정보 생성 실패: ${insertError.message}`);
    return redirectToLoginWithError(request, "user_insert_failed");
  }

  return NextResponse.redirect(new URL(ROUTES.HOME, request.nextUrl.origin));
}
