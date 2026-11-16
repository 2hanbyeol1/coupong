import { getAuthUser } from "@/entities/auth/api/api";
import { UserType } from "@/entities/user/api/type";
import { AddOrganizationFormValues } from "@/features/add-organization/lib/schema";
import {
  NOT_FOUND_ERROR_CODE,
  RAISED_ERROR_CODE,
} from "@/shared/lib/constants/error-code";
import createBrowserClient from "@/shared/lib/supabase/client";

import { getOrganizationErrorMessage } from "../lib/error";

import {
  OrganizationMemberType,
  OrganizationRole,
  OrganizationType,
} from "./type";

const ORGANIZATION_TABLE = "organizations";
const MEMBER_TABLE = "user_organization";

// 그룹 정보를 추가
export async function addOrganization(organization: AddOrganizationFormValues) {
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from(ORGANIZATION_TABLE)
    .insert(organization);

  // 트리거(on_organization_created)가 생성한 유저를 user_organization에 자동 추가.

  if (error) {
    console.error(`그룹 정보를 업로드하는 중 에러 발생: ${error.message}`);
    throw new Error(
      getOrganizationErrorMessage(error) ??
        "그룹 정보를 등록하는 중 오류가 발생했어요",
    );
  }
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

// organization의 id를 이용하여 그룹에 소속된 멤버 정보를 조회 (관리자 → 먼저 들어온 순)
export async function getOrganizationMembers(orgId: OrganizationType["id"]) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from(MEMBER_TABLE)
    .select("*, user:users(name)")
    .eq("organization_id", orgId)
    .order("role")
    .order("created_at");

  if (error) {
    console.error(`조직 멤버 정보 조회 중 에러 발생: ${error.message}`);
    throw Error("조직 멤버 정보 조회에 실패했어요");
  }
  return data;
}

// 그룹원의 권한을 변경 (관리자만, 본인 제외)
export async function setOrganizationMemberRole(
  memberId: OrganizationMemberType["id"],
  role: OrganizationRole,
) {
  const supabase = createBrowserClient();
  const { error } = await supabase.rpc("set_organization_member_role", {
    p_member_id: memberId,
    p_role: role,
  });

  if (error) {
    console.error(`그룹원 권한 변경 중 에러 발생: ${error.message}`);
    throw new Error(
      error.code === RAISED_ERROR_CODE
        ? error.message
        : "그룹원 권한을 바꾸지 못했어요",
    );
  }
}

// 그룹원을 그룹에서 내보냄 (관리자만, 본인 제외)
export async function removeOrganizationMember(
  memberId: OrganizationMemberType["id"],
) {
  const supabase = createBrowserClient();
  const { error } = await supabase.rpc("remove_organization_member", {
    p_member_id: memberId,
  });

  if (error) {
    console.error(`그룹원 내보내기 중 에러 발생: ${error.message}`);
    throw new Error(
      error.code === RAISED_ERROR_CODE
        ? error.message
        : "그룹원을 내보내지 못했어요",
    );
  }
}

export interface LeaveOrganizationResult {
  /** 마지막 그룹원이라 그룹이 삭제됐는지 */
  deleted: boolean;
  /** 마지막 관리자가 나가 새로 관리자가 된 사람 이름 */
  newAdminName: string | null;
}

/**
 * 그룹에서 나감
 * - 마지막 관리자면 newAdminMemberId 그룹원이 관리자가 됨 (없으면 가장 먼저 들어온 그룹원)
 * - 마지막 그룹원이면 그룹이 삭제됨
 */
export async function leaveOrganization(
  orgId: OrganizationType["id"],
  newAdminMemberId?: OrganizationMemberType["id"],
): Promise<LeaveOrganizationResult> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.rpc("leave_organization", {
    p_organization_id: orgId,
    p_new_admin_member_id: newAdminMemberId,
  });

  if (error) {
    console.error(`그룹 나가기 중 에러 발생: ${error.message}`);
    throw new Error(
      error.code === RAISED_ERROR_CODE
        ? error.message
        : "그룹에서 나가지 못했어요",
    );
  }

  const result = data as { deleted?: boolean; new_admin_name?: string | null };
  return {
    deleted: !!result?.deleted,
    newAdminName: result?.new_admin_name ?? null,
  };
}

/**
 * 내가 속한 그룹 id 목록 (로그인하지 않았으면 null)
 * 저장해 둔 선택 그룹이 아직 유효한지 확인하는 데 씀
 */
export async function getMyOrganizationIds() {
  const supabase = createBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from(MEMBER_TABLE)
    .select("organization_id")
    .eq("user_id", session.user.id);

  if (error) {
    console.error(`내 그룹 목록 조회 중 에러 발생: ${error.message}`);
    throw Error("내 그룹 목록 조회에 실패했어요");
  }
  return data.map((row) => row.organization_id);
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

// 로그인 된 사용자의 그룹 내 권한을 조회 (소속되지 않았으면 null)
export async function getMyOrganizationRole(
  organizationId: OrganizationType["id"],
) {
  const user = await getAuthUser();
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from(MEMBER_TABLE)
    .select("role")
    .eq("user_id", user.id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) {
    console.error(`그룹 권한 조회 중 에러 발생: ${error.message}`);
    throw Error("그룹 권한 조회에 실패했어요");
  }
  return data?.role ?? null;
}
