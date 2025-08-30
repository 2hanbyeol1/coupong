import createBrowserClient from "@/shared/lib/supabase/client";

export const getSupabasePublicImageUrl = (
  bucket: string,
  imagePath: string,
) => {
  const supabase = createBrowserClient();
  return supabase.storage.from(bucket).getPublicUrl(imagePath);
};
