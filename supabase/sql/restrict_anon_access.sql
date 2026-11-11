-- 비로그인(anon) 접근 차단
-- 1. coupons 테이블을 로그인 없이 전부 읽을 수 있던 정책 삭제
--    앱의 쿠폰 조회는 로그인 세션으로 하고, 푸시 API는 service_role을 쓰므로 영향 없음
-- 2. SECURITY DEFINER 함수를 API(/rest/v1/rpc)로 직접 호출하지 못하도록 실행 권한 회수
--    트리거 함수는 실행 시점에 EXECUTE 권한을 확인하지 않고,
--    notify_expiring_coupons는 pg_cron이 postgres 권한으로 실행하므로 동작은 그대로
drop policy if exists "Allow anonymous access" on public.coupons;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.add_creator_to_organization() from public, anon, authenticated;
revoke execute on function public.notify_expiring_coupons() from public, anon, authenticated;

-- 되돌리기
-- create policy "Allow anonymous access" on public.coupons for select to anon using (true);
-- grant execute on function public.handle_new_user(), public.add_creator_to_organization(), public.notify_expiring_coupons() to public, anon, authenticated;
