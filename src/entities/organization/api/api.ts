import { getAuthUser } from "@/entities/auth/api/api";
import { UserType } from "@/entities/user/api/type";
import { AddOrganizationFormValues } from "@/features/add-organization/lib/schema";
import { NOT_FOUND_ERROR_CODE } from "@/shared/lib/constants/error-code";
import createBrowserClient from "@/shared/lib/supabase/client";

import { getOrganizationErrorMessage } from "../lib/error";

import { OrganizationType } from "./type";

const ORGANIZATION_TABLE = "organizations";
const MEMBER_TABLE = "user_organization";

// 그룹 정보를 추가
export async function addOrganization(organization: AddOrganizationFormValues) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from(ORGANIZATION_TABLE)
    .insert(organization)
    .select();

  if (error) {
    console.error(`그룹 정보를 업로드하는 중 에러 발생: ${error.message}`);
    throw new Error(
      getOrganizationErrorMessage(error) ??
        "그룹 정보를 등록하는 중 오류가 발생했어요",
    );
  }

  return data;
}

// organization의 id를 이용하여 그룹 정보를 조회
export async function getOrganizationById(orgId: OrganizationType["id"]) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from(ORGANIZATION_TABLE)
    .select("*")
    .eq("id", orgId)
    .single();

  if (error) {
    if (error.code === NOT_FOUND_ERROR_CODE) return null;

    console.error(`조직 정보 조회 중 에러 발생: ${error.message}`);
    throw Error("조직 정보 조회에 실패했어요");
  }
  return data;
}

// organization의 id를 이용하여 그룹에 소속된 멤버 정보를 조회
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

// 사용자의 id와 그룹의 id를 이용하여 특정 사용자가 해당 그룹에 이미 소속되어 있는지 여부를 조회
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

// 그룹의 id를 이용하여 로그인 된 사용자가 해당 그룹에 이미 소속되어 있는지 여부를 조회
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
