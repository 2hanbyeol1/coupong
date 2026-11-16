import { getAuthUser } from "@/entities/auth/api/api";
import createBrowserClient from "@/shared/lib/supabase/client";

import { InsertInvitationType, InvitationType } from "./type";

const INVITATION_TABLE = "invitations";
const INVITATION_ERROR_CODE = "P0001";

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
    // P0001: 만료·이미 수락 등 사용자에게 보여줄 사유
    throw new Error(
      error.code === INVITATION_ERROR_CODE
        ? error.message
        : "초대 수락에 실패했어요",
    );
  }
  return data;
};
