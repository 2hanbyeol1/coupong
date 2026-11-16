-- 그룹원 관리 (관리자 전용)
-- user_organization에는 UPDATE·DELETE 정책을 두지 않고, 아래 함수로만 권한 변경·내보내기를 처리
-- - 호출한 사람이 해당 그룹의 관리자여야 함
-- - 본인의 권한은 바꾸거나 본인을 내보낼 수 없음 (그룹에 관리자가 한 명도 남지 않는 것 방지)
-- 사용자에게 보여줄 오류는 P0001(raise exception 기본 코드)로 던짐

create or replace function public.set_organization_member_role(
  p_member_id uuid,
  p_role public.organization_role
)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
  declare
    v_member public.user_organization;
  begin
    select * into v_member
    from public.user_organization
    where id = p_member_id
    for update;

    if not found then
      raise exception '그룹원을 찾을 수 없어요';
    end if;

    if not public.is_organization_admin(v_member.organization_id) then
      raise exception '그룹원을 관리할 권한이 없어요';
    end if;

    if v_member.user_id = (select auth.uid()) then
      raise exception '내 권한은 바꿀 수 없어요';
    end if;

    update public.user_organization
    set role = p_role
    where id = p_member_id;
  end;
$function$;

create or replace function public.remove_organization_member(p_member_id uuid)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
  declare
    v_member public.user_organization;
  begin
    select * into v_member
    from public.user_organization
    where id = p_member_id
    for update;

    if not found then
      raise exception '그룹원을 찾을 수 없어요';
    end if;

    if not public.is_organization_admin(v_member.organization_id) then
      raise exception '그룹원을 관리할 권한이 없어요';
    end if;

    if v_member.user_id = (select auth.uid()) then
      raise exception '나를 내보낼 수는 없어요';
    end if;

    delete from public.user_organization
    where id = p_member_id;
  end;
$function$;

revoke execute on function public.set_organization_member_role(uuid, public.organization_role) from public, anon;
grant execute on function public.set_organization_member_role(uuid, public.organization_role) to authenticated;
revoke execute on function public.remove_organization_member(uuid) from public, anon;
grant execute on function public.remove_organization_member(uuid) to authenticated;

-- 되돌리기
-- drop function if exists public.set_organization_member_role(uuid, public.organization_role);
-- drop function if exists public.remove_organization_member(uuid);
