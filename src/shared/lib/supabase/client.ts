import { createBrowserClient } from "@supabase/ssr";

import { Database } from "@/shared/config/database.types";

export default function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const client = createBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!);
  return client;
}
