import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch (error) {
            // Server Component에서 setAll을 호출하는 경우 에러 발생
            // Route Handler, middleware, Server Action을 사용해야 함
            if (process.env.NODE_ENV === "development") {
              console.warn("Cookie setAll failed in Server Component:", error);
            }
          }
        },
      },
    },
  );
}
