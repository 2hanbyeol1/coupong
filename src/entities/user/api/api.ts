import { getAuthUser } from "@/entities/auth/api/api";
import createBrowserClient from "@/shared/lib/supabase/client";
import { getSupabasePublicImageUrl } from "@/shared/lib/util/image";

import { UserType } from "./type";

const USER_TABLE = "users";
const USER_GROUP_TABLE = "user_organization";
export const USER_IMAGE_BUCKET = "user-image";

export async function getSessionUser() {
  const user = await getAuthUser();
  return getUserById(user.id);
}

export async function getUserById(userId: UserType["user_id"]) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from(USER_TABLE)
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) {
    console.error(`사용자 정보 조회 중 에러 발생: ${error.message}`);
    throw Error("사용자 정보 조회 중 오류가 발생했어요");
  }
  return data;
}

export async function getUserGroups({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) {
  const user = await getAuthUser();
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from(USER_GROUP_TABLE)
    .select(
      `
        *,
        organizations (
          *
        )
      `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    console.error("사용자 그룹 조회 에러:", error);
    throw new Error("사용자 그룹을 가져오는 중 오류가 발생했어요");
  }

  const { count, error: countError } = await supabase
    .from(USER_GROUP_TABLE)
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (countError) {
    console.error("사용자 그룹 카운트 조회 에러:", countError);
    throw new Error("사용자 그룹의 개수를 가져오는 중 오류가 발생했어요");
  }
  return { data, hasNext: (count ?? 0) > page * limit };
}

export async function updateUserProfile(newProfile: Partial<UserType>) {
  const supabase = createBrowserClient();
  const user = await getAuthUser();
  const { error } = await supabase
    .from(USER_TABLE)
    .update(newProfile)
    .eq("user_id", user.id);

  console.log(user.id);

  if (error) {
    console.error("사용자 정보 수정 에러:", error);
    throw new Error("사용자 정보를 수정하는 중 오류가 발생했어요");
  }
}

export const uploadUserImage = async (userId: string, imageFile: File) => {
  const supabase = createBrowserClient();

  const { data, error } = await supabase.storage
    .from(USER_IMAGE_BUCKET)
    .upload(`${userId}/${crypto.randomUUID()}`, imageFile);

  if (error) {
    console.error(
      `사용자 프로필 이미지를 업로드하는 중 에러 발생: ${error.message}`,
    );
    throw new Error("사용자 프로필 이미지 업로드 중 오류가 발생했어요");
  }
  return data.path;
};

export function getUserImageUrl(imagePath: UserType["image_path"]) {
  if (!imagePath) return null;
  return getSupabasePublicImageUrl(USER_IMAGE_BUCKET, imagePath).data.publicUrl;
}
