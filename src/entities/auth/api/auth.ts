import createClient from "@/shared/lib/supabase/client";

export async function signInWithKakao() {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "kakao",
    options: {
      redirectTo: `${location.origin}/api/auth/callback`,
    },
  });
  if (error) {
    console.error(`카카오 로그인 중 에러 발생: ${error.message}`);
    throw Error("카카오 로그인 중 오류가 발생했어요");
  }
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error(`로그아웃 중 에러 발생: ${error.message}`);
    throw Error("로그아웃 중 오류가 발생했어요");
  }
}

export async function getAuthUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error(`사용자 Auth 정보 조회 중 에러 발생: ${error.message}`);
    throw Error("사용자 Auth 정보 조회 중 오류가 발생했어요");
  }
  return data.user;
}
