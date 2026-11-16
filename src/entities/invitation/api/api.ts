import { getAuthUser } from "@/entities/auth/api/api";
import { RAISED_ERROR_CODE } from "@/shared/lib/constants/error-code";
import createBrowserClient from "@/shared/lib/supabase/client";

import { INVITATION_VALID_DAYS } from "../lib/constants";

import { InsertInvitationType, InvitationType } from "./type";

const INVITATION_TABLE = "invitations";
/** 이 시각 이후에 만든 초대만 아직 유효함 */
const getInvitationValidFrom = () =>
  new Date(
    Date.now() - INVITATION_VALID_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

// 그룹에서 아직 수락되지 않은 유효한 초대 목록 (최근 순)
export async function getPendingInvitations(
  organizationId: InvitationType["organization_id"],
) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from(INVITATION_TABLE)
    .select("*, inviter:users!invited_by(name)")
    .eq("organization_id", organizationId)
    .is("accepted", null)
    .gte("created_at", getInvitationValidFrom())
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`그룹 초대 목록 조회 중 에러 발생: ${error.message}`);
    throw Error("초대 목록 조회에 실패했어요");
  }
  return data;
}

// 아직 수락되지 않은 초대를 취소 (초대한 사람 또는 그룹 관리자만)
export async function cancelInvitation(invitationId: InvitationType["id"]) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from(INVITATION_TABLE)
    .delete()
    .eq("id", invitationId)
    .select("id");

  if (error) {
    console.error(`초대 취소 중 에러 발생: ${error.message}`);
    throw new Error("초대를 취소하지 못했어요");
  }
  // 권한이 없거나 이미 수락된 초대면 RLS가 에러 없이 0건을 삭제함
  if (data.length === 0) {
    throw new Error("이미 수락됐거나 취소할 수 없는 초대예요");
  }
}

export async function getMyInvitations() {
  const user = await getAuthUser();
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from(INVITATION_TABLE)
    .select("*")
    .eq("invite_user", user.id);

  if (error) {
    console.error(`내 초대 정보 조회 중 에러 발생: ${error.message}`);
    throw Error("초대 정보 조회에 실패했어요");
  }
  return data;
}

export async function getInvitationByToken(token: InvitationType["token"]) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from(INVITATION_TABLE)
    .select(
      `
        *,
        organizations (*)
      `,
    )
    .eq("token", token)
    .limit(1);

  if (error) {
    console.error(`초대 정보 조회 중 에러 발생: ${error.message}`);
    throw Error("초대 정보 조회에 실패했어요");
  }
  return data?.[0];
}

export const addInvitation = async (
  inviteEmail: InsertInvitationType["invite_email"],
  organizationId: InsertInvitationType["organization_id"],
) => {
  const user = await getAuthUser();
  const supabase = createBrowserClient();
  const token = crypto.randomUUID();

  const { data: duplicateInvitation, error: getDuplicateInvitationError } =
    await supabase
      .from(INVITATION_TABLE)
      .select()
      .eq("invite_email", inviteEmail)
      .eq("organization_id", organizationId)
      .is("accepted", null)
      .gte("created_at", getInvitationValidFrom())
      .limit(1);
  if (getDuplicateInvitationError)
    throw new Error("초대 정보 조회에 실패했어요");
  if (duplicateInvitation.length > 0)
    throw Error("이미 해당 그룹에 초대 중인 이메일이예요");

  const { error } = await supabase
    .from(INVITATION_TABLE)
    .insert<InsertInvitationType>({
      invite_email: inviteEmail,
      invited_by: user.id,
      organization_id: organizationId,
      token,
    });

  if (error) {
    console.error(`초대 정보를 업로드하는 중 에러 발생: ${error.message}`);
    throw new Error("초대 정보 등록에 실패했어요");
  }
  return token;
};

// 초대를 수락하고 그룹에 가입 (초대받은 이메일로 로그인한 경우만 가능)
export const acceptInvitation = async (token: InvitationType["token"]) => {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.rpc("accept_invitation", {
    p_token: token,
  });

  if (error) {
    console.error(`초대를 수락하는 중 에러 발생: ${error.message}`);
    // 만료·이미 수락 등 사용자에게 보여줄 사유
    throw new Error(
      error.code === RAISED_ERROR_CODE
        ? error.message
        : "초대 수락에 실패했어요",
    );
  }
  return data;
};
