-- 그룹 나가기
-- user_organization에는 DELETE 정책이 없으므로 이 함수로만 나감
-- - 내가 마지막 관리자면 p_new_admin_member_id로 고른 그룹원을 관리자로 지정 (관리자 없는 그룹 방지)
--   고르지 않았으면 남은 그룹원 중 가장 먼저 들어온 사람을 지정
-- - 내가 마지막 그룹원이면 그룹을 삭제 (쿠폰·초대장·그룹원은 FK on delete cascade로 함께 삭제)
--   쿠폰 사진(storage)은 SQL로 지울 수 없어 클라이언트가 나가기 전에 지움
-- 반환: { deleted: 그룹이 삭제됐는지, new_admin_name: 새로 관리자가 된 사람 이름 }
-- 사용자에게 보여줄 오류는 P0001(raise exception 기본 코드)로 던짐

-- 인자가 바뀌어 같은 이름의 함수가 두 개 생기지 않도록 이전 함수를 지움
drop function if exists public.leave_organization(uuid);

create or replace function public.leave_organization(
  p_organization_id uuid,
  p_new_admin_member_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
  declare
    v_user_id uuid := (select auth.uid());
    v_me public.user_organization;
    v_new_admin public.user_organization;
    v_new_admin_name text;
  begin
    if v_user_id is null then
      raise exception '로그인이 필요해요';
    end if;

    -- 동시에 여러 명이 나가도 관리자·그룹원 수를 정확히 세도록 그룹원 전체를 잠금
    perform 1
    from public.user_organization
    where organization_id = p_organization_id
    for update;

    select * into v_me
    from public.user_organization
    where organization_id = p_organization_id
      and user_id = v_user_id;

    if not found then
      raise exception '이미 나간 그룹이에요';
    end if;

    if not exists (
      select 1
      from public.user_organization
      where organization_id = p_organization_id
        and user_id <> v_user_id
    ) then
      delete from public.organizations
      where id = p_organization_id;

      return jsonb_build_object('deleted', true, 'new_admin_name', null);
    end if;

    if v_me.role = 'admin' and not exists (
      select 1
      from public.user_organization
      where organization_id = p_organization_id
        and user_id <> v_user_id
        and role = 'admin'
    ) then
      if p_new_admin_member_id is not null then
        select * into v_new_admin
        from public.user_organization
        where id = p_new_admin_member_id
          and organization_id = p_organization_id
          and user_id <> v_user_id;

        if not found then
          raise exception '관리자로 고른 그룹원이 그룹에 없어요';
        end if;
      else
        select * into v_new_admin
        from public.user_organization
        where organization_id = p_organization_id
          and user_id <> v_user_id
        order by created_at, id
        limit 1;
      end if;

      update public.user_organization
      set role = 'admin'
      where id = v_new_admin.id;

      select name into v_new_admin_name
      from public.users
      where user_id = v_new_admin.user_id;
    end if;

    delete from public.user_organization
    where id = v_me.id;

    return jsonb_build_object('deleted', false, 'new_admin_name', v_new_admin_name);
  end;
$function$;

revoke execute on function public.leave_organization(uuid, uuid) from public, anon;
grant execute on function public.leave_organization(uuid, uuid) to authenticated;

-- 되돌리기
-- drop function if exists public.leave_organization(uuid, uuid);
