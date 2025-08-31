import createBrowserClient from "@/shared/lib/supabase/client";

import { OrganizationType } from "./type";

const ORG_TABLE = "organizations";

export async function getOrganizationById(orgId: OrganizationType["id"]) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from(ORG_TABLE)
    .select("*")
    .eq("id", orgId)
    .single();

  if (error) {
    console.error(`조직 정보 조회 중 에러 발생: ${error.message}`);
    throw Error("조직 정보 조회 중 오류가 발생했어요");
  }
  return data;
}
