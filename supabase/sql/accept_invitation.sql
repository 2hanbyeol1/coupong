-- 초대를 받은 사람만 그룹에 가입
-- 지금까지는 user_organization에 직접 insert해서, 그룹 ID만 알면 초대 없이도 가입할 수 있었음
-- 1. 초대 수락은 accept_invitation(token) 함수로만 처리
--    초대 이메일 = 로그인 이메일, 수락 전, 7일 이내인 초대만 수락 가능하고 수락하면 accepted = true
-- 2. user_organization INSERT 정책 삭제 (그룹 생성 트리거와 위 함수만 멤버를 추가)
-- 3. 초대장은 그룹 멤버만 본인 이름으로 만들 수 있음 (아무 그룹에나 자기 자신을 초대하는 것 방지)
-- 4. 초대장은 초대받은 사람과 그 그룹 멤버만 볼 수 있음 (다른 사람의 초대 토큰·이메일 노출 방지)
-- 5. 같은 사람이 같은 그룹에 두 번 들어가지 않도록 unique 제약 추가

alter table public.user_organization
  add constraint user_organization_user_id_organization_id_key
  unique (user_id, organization_id);

-- 사용자에게 보여줄 오류는 P0001(raise exception 기본 코드)로 던짐
create or replace function public.accept_invitation(p_token text)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
  declare
    v_user_id uuid := (select auth.uid());
    v_email text := (select auth.jwt() ->> 'email');
    v_invitation public.invitations;
  begin
    if v_user_id is null then
      raise exception '로그인이 필요해요';
    end if;

    select * into v_invitation
    from public.invitations
    where token = p_token
    for update;

    if not found or lower(v_invitation.invite_email) <> lower(coalesce(v_email, '')) then
      raise exception '초대장을 찾을 수 없어요';
    end if;

    if v_invitation.accepted is not null then
      raise exception '이미 %된 초대장이예요',
        case when v_invitation.accepted then '수락' else '거절' end;
    end if;

    if v_invitation.created_at < now() - interval '7 days' then
      raise exception '기간이 지나 만료된 초대장이예요';
    end if;

    insert into public.user_organization (user_id, organization_id, role)
    values (v_user_id, v_invitation.organization_id, 'member')
    on conflict (user_id, organization_id) do nothing;

    update public.invitations
    set accepted = true
    where id = v_invitation.id;

    return v_invitation.organization_id;
  end;
$function$;

revoke execute on function public.accept_invitation(text) from public, anon;
grant execute on function public.accept_invitation(text) to authenticated;

drop policy if exists "Enable insert self as member only" on public.user_organization;

drop policy if exists "Enable insert for authenticated users only" on public.invitations;
create policy "Enable insert invitation for organization member only"
  on public.invitations for insert to authenticated
  with check (
    invited_by = (select auth.uid())
    and exists (
      select 1
      from public.user_organization uo
      where uo.organization_id = invitations.organization_id
        and uo.user_id = (select auth.uid())
    )
  );

drop policy if exists "Enable read access for authenticated users" on public.invitations;
create policy "Enable read invitation for invitee or organization member"
  on public.invitations for select to authenticated
  using (
    lower(invite_email) = lower((select auth.jwt() ->> 'email'))
    or exists (
      select 1
      from public.user_organization uo
      where uo.organization_id = invitations.organization_id
        and uo.user_id = (select auth.uid())
    )
  );

-- 되돌리기
-- drop policy if exists "Enable read invitation for invitee or organization member" on public.invitations;
-- create policy "Enable read access for authenticated users" on public.invitations for select to authenticated using (true);
-- drop policy if exists "Enable insert invitation for organization member only" on public.invitations;
-- create policy "Enable insert for authenticated users only" on public.invitations for insert to authenticated with check (true);
-- create policy "Enable insert self as member only" on public.user_organization for insert to authenticated with check (user_id = (select auth.uid()) and role = 'member');
-- drop function if exists public.accept_invitation(text);
-- alter table public.user_organization drop constraint user_organization_user_id_organization_id_key;
