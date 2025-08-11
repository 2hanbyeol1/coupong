import { NextRequest, NextResponse } from "next/server";

import { ROUTES } from "@/shared/config";
import createClient from "@/shared/config/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
  }
}
