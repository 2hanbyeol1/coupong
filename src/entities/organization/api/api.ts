import { getAuthUser } from "@/entities/auth/api/api";
import { UserType } from "@/entities/user/api/type";
import createBrowserClient from "@/shared/lib/supabase/client";

import { OrganizationType } from "./type";

const ORGANIZATION_TABLE = "organizations";
const MEMBER_TABLE = "user_organization";

export async function getOrganizationById(orgId: OrganizationType["id"]) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from(ORGANIZATION_TABLE)
    .select("*")
    .eq("id", orgId)
    .single();

  if (error) {
    console.error(`조직 정보 조회 중 에러 발생: ${error.message}`);
    throw Error("조직 정보 조회에 실패했어요");
  }
  return data;
}

export async function getOrganizationMembers(orgId: OrganizationType["id"]) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from(MEMBER_TABLE)
    .select("*")
    .eq("organization_id", orgId);

  if (error) {
    console.error(`조직 멤버 정보 조회 중 에러 발생: ${error.message}`);
    throw Error("조직 멤버 정보 조회에 실패했어요");
  }
  return data;
}

export async function checkIsDuplicateMember(
  userId: UserType["user_id"],
  orgId: OrganizationType["id"],
) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from(MEMBER_TABLE)
    .select("*")
    .eq("organization_id", orgId)
    .eq("user_id", userId)
    .limit(1);

  if (error) {
    console.error(`중복 멤버 정보 조회 중 에러 발생: ${error.message}`);
    throw Error("중복 멤버 정보 조회에 실패했어요");
  }
  return data.length > 0;
}

export async function checkIsUserBelongsToOrganization(
  organizationId: OrganizationType["id"],
) {
  const user = await getAuthUser();
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from(MEMBER_TABLE)
    .select("*")
    .eq("user_id", user.id)
    .eq("organization_id", organizationId)
    .limit(1);

  if (error) {
    console.error(`조직 멤버 여부 조회 중 에러 발생: ${error.message}`);
    throw Error("조직 멤버 여부 조회에 실패했어요");
  }
  return !!data?.[0];
}
