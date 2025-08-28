import { getAuthUser } from "@/entities/auth/api/auth";
import createClient from "@/shared/lib/supabase/client";

const USER_TABLE = "users";
const USER_GROUP_TABLE = "user_organization";

export async function getUser() {
  const user = await getAuthUser();
  const supabase = createClient();
  const { data, error } = await supabase
    .from(USER_TABLE)
    .select("*")
    .eq("user_id", user.id)
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
  const supabase = createClient();

  const { data, error } = await supabase
    .from(USER_GROUP_TABLE)
    .select(
      `
        *,
        organizations (
          name
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
