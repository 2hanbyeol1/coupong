import { NextRequest, NextResponse } from "next/server";

import { ROUTES } from "@/shared/config/routes";
import createClient from "@/shared/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code)
    return NextResponse.json(
      { error: "SearchParams code is missing" },
      { status: 500 },
    );

  const { data, error: exchangeCodeError } =
    await supabase.auth.exchangeCodeForSession(code);
  if (exchangeCodeError)
    return NextResponse.json(
      { error: exchangeCodeError.message },
      { status: 500 },
    );

  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("user_id", data.user.id)
    .single();

  if (existingUser)
    return NextResponse.redirect(new URL(ROUTES.HOME, request.url));

  const { error: insertError } = await supabase.from("users").insert({
    user_id: data.user.id,
    name: data.user.user_metadata?.name || data.user.email || "사용자",
  });

  if (insertError)
    return NextResponse.json({ error: insertError.message }, { status: 500 });

  return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
}
