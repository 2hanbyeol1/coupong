-- 그룹(조직)별 멤버 권한
-- 1. user_organization.role 추가 (admin: 관리자, member: 일반 멤버)
--    그룹을 만든 사람은 관리자, 초대로 들어온 사람은 일반 멤버
--    기존 그룹은 가장 먼저 들어온 멤버를 관리자로 지정
-- 2. 관리자는 그룹의 모든 쿠폰을 수정·삭제할 수 있음 (일반 멤버는 자기가 올린 쿠폰만)
--    쿠폰 사용 처리(used_by)는 지금처럼 그룹 멤버 누구나 가능
-- 3. 클라이언트가 스스로 관리자로 가입하거나 다른 사람을 가입시키지 못하게 막음

create type public.organization_role as enum ('admin', 'member');

alter table public.user_organization
  add column role public.organization_role not null default 'member';

update public.user_organization uo
set role = 'admin'
where uo.id in (
  select distinct on (organization_id) id
  from public.user_organization
  order by organization_id, created_at
);

create or replace function public.add_creator_to_organization()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
  begin
    insert into public.user_organization (user_id, organization_id, role)
    values (auth.uid(), new.id, 'admin');
    return new;
  end;
$function$;

-- 로그인한 사용자가 그룹의 관리자인지 (RLS·트리거에서 사용)
create or replace function public.is_organization_admin(p_organization_id uuid)
returns boolean
language sql
stable
set search_path to ''
as $function$
  select exists (
    select 1
    from public.user_organization
    where organization_id = p_organization_id
      and user_id = (select auth.uid())
      and role = 'admin'
  );
$function$;

revoke execute on function public.is_organization_admin(uuid) from public, anon;
grant execute on function public.is_organization_admin(uuid) to authenticated;

-- 초대 수락으로 가입할 때 본인만, 일반 멤버로만 추가 가능
drop policy if exists "Enable insert for authenticated users only" on public.user_organization;
create policy "Enable insert self as member only"
  on public.user_organization for insert to authenticated
  with check (user_id = (select auth.uid()) and role = 'member');

-- 쿠폰 삭제: 올린 사람 또는 그룹 관리자
drop policy if exists "Enable delete coupon for upload users only" on public.coupons;
create policy "Enable delete coupon for uploader or organization admin"
  on public.coupons for delete to authenticated
  using (
    (select auth.uid()) = uploaded_by
    or public.is_organization_admin(organization_id)
  );

-- 쿠폰 수정: UPDATE 정책은 쿠폰 사용 처리 때문에 그룹 멤버 전체에 열려 있으므로,
-- 쿠폰 정보(이름·사용처·유효기간·사진) 변경은 트리거로 올린 사람 또는 관리자만 허용
-- service_role(푸시 API·크론)은 auth.uid()가 없으므로 검사하지 않음
create or replace function public.check_coupon_update_permission()
returns trigger
language plpgsql
set search_path to ''
as $function$
  begin
    if (select auth.uid()) is null then
      return new;
    end if;

    if new.organization_id is distinct from old.organization_id
      or new.uploaded_by is distinct from old.uploaded_by then
      raise exception '쿠폰의 그룹이나 등록자는 바꿀 수 없어요'
        using errcode = '42501';
    end if;

    if (
      new.name is distinct from old.name
      or new.place is distinct from old.place
      or new.expire_at is distinct from old.expire_at
      or new.image_path is distinct from old.image_path
    )
    and old.uploaded_by <> (select auth.uid())
    and not public.is_organization_admin(old.organization_id) then
      raise exception '쿠폰을 수정할 권한이 없어요'
        using errcode = '42501';
    end if;

    return new;
  end;
$function$;

revoke execute on function public.check_coupon_update_permission() from public, anon, authenticated;

create trigger check_coupon_update_permission
  before update on public.coupons
  for each row execute function public.check_coupon_update_permission();

-- 되돌리기
-- drop trigger if exists check_coupon_update_permission on public.coupons;
-- drop function if exists public.check_coupon_update_permission();
-- drop policy if exists "Enable delete coupon for uploader or organization admin" on public.coupons;
-- create policy "Enable delete coupon for upload users only" on public.coupons for delete to authenticated using ((select auth.uid()) = uploaded_by);
-- drop policy if exists "Enable insert self as member only" on public.user_organization;
-- create policy "Enable insert for authenticated users only" on public.user_organization for insert to authenticated with check (true);
-- drop function if exists public.is_organization_admin(uuid);
-- create or replace function public.add_creator_to_organization() returns trigger language plpgsql security definer set search_path to 'public'
--   as $$ begin insert into public.user_organization (user_id, organization_id) values (auth.uid(), new.id); return new; end; $$;
-- alter table public.user_organization drop column role;
-- drop type public.organization_role;
