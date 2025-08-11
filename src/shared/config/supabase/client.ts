import { createBrowserClient } from "@supabase/ssr";

export default function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const client = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
  return client;
}
