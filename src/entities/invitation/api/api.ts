import { getAuthUser } from "@/entities/auth/api/api";
import createBrowserClient from "@/shared/lib/supabase/client";

import { InsertInvitationType, InvitationType } from "./type";

const INVITATION_TABLE = "invitations";

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

export const approveInvitation = async (invitationId: InvitationType["id"]) => {
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from(INVITATION_TABLE)
    .update({ accepted: true })
    .eq("id", invitationId);

  if (error) {
    console.error(`초대 정보를 수락하는 중 에러 발생: ${error.message}`);
    throw new Error("초대 정보 수락에 실패했어요");
  }
};
