-- 금액권 (잔액 관리)
-- 1. coupons.type: exchange(교환권, 한 번 쓰면 끝) / amount(금액권, 쓸 때마다 잔액 차감)
--    기존 쿠폰은 모두 교환권
-- 2. coupons.face_value: 금액권의 처음 금액 (교환권은 null)
--    coupons.used_amount: 지금까지 쓴 금액 합계 (사용·기록 삭제 함수로만 바뀜)
-- 3. coupon_usages: 금액권 사용 내역 (누가·언제·얼마)
--    추가·삭제는 use_amount_coupon / delete_coupon_usage 함수로만
--    (쿠폰 행을 잠그고 잔액을 확인하므로 두 사람이 동시에 써도 잔액을 넘지 않음)
-- 4. 금액권의 used_by는 잔액으로 정해짐: 남은 금액이 0원이면 마지막으로 쓴 사람, 남아 있으면 null
--    → 목록 탭(사용 가능 / 지난 쿠폰)·만료 알림은 지금처럼 used_by만 보면 됨
-- 사용자에게 보여줄 오류는 P0001(raise exception 기본 코드)로 던짐

create type public.coupon_type as enum ('exchange', 'amount');

alter table public.coupons
  add column type public.coupon_type not null default 'exchange',
  add column face_value integer,
  add column used_amount integer not null default 0,
  add constraint coupons_amount_check check (
    (type = 'exchange' and face_value is null and used_amount = 0)
    or (
      type = 'amount'
      and face_value between 1 and 10000000
      and used_amount between 0 and face_value
    )
  );

create table public.coupon_usages (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  user_id uuid references public.users(user_id) on delete set null,
  amount integer not null check (amount > 0),
  created_at timestamptz not null default now()
);

create index coupon_usages_coupon_id_idx
  on public.coupon_usages (coupon_id, created_at desc);

alter table public.coupon_usages enable row level security;

-- 읽기: 쿠폰이 속한 그룹의 멤버만 (추가·삭제 정책은 없음 → 함수로만)
create policy "Enable read coupon usage for organization users only"
  on public.coupon_usages for select to authenticated
  using (
    coupon_id in (
      select c.id
      from public.coupons c
      join public.user_organization uo on uo.organization_id = c.organization_id
      where uo.user_id = (select auth.uid())
    )
  );

-- 금액권 상태 맞추기 (BEFORE INSERT/UPDATE)
-- 트리거는 이름 순서로 실행되므로 check_coupon_update_permission(권한 검사) 다음에 실행됨
create or replace function public.sync_amount_coupon_used_by()
returns trigger
language plpgsql
set search_path to ''
as $function$
  begin
    -- 새로 등록하는 쿠폰은 쓴 금액·사용자 없이 시작
    if tg_op = 'INSERT' then
      new.used_amount := 0;
      if new.type = 'amount' then
        new.used_by := null;
      end if;
      return new;
    end if;

    if new.type <> 'amount' then
      return new;
    end if;

    if new.used_amount >= new.face_value then
      -- 이미 다 쓴 상태였으면 그대로, 이번에 0원이 됐으면 마지막으로 쓴 사람
      if old.type <> 'amount' or old.used_amount < old.face_value or new.used_by is null then
        new.used_by := (
          select user_id
          from public.coupon_usages
          where coupon_id = new.id
          order by created_at desc
          limit 1
        );
      else
        new.used_by := old.used_by;
      end if;
    else
      new.used_by := null;
    end if;

    return new;
  end;
$function$;

revoke execute on function public.sync_amount_coupon_used_by() from public, anon, authenticated;

create trigger sync_amount_coupon_used_by
  before insert or update on public.coupons
  for each row execute function public.sync_amount_coupon_used_by();

-- 쿠폰 수정 권한 검사에 종류·금액 추가
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
      or new.type is distinct from old.type
      or new.face_value is distinct from old.face_value
    )
    and old.uploaded_by <> (select auth.uid())
    and not public.is_organization_admin(old.organization_id) then
      raise exception '쿠폰을 수정할 권한이 없어요'
        using errcode = '42501';
    end if;

    -- 쓴 금액은 사용·기록 삭제 함수에서만 바꿈
    if new.used_amount is distinct from old.used_amount
      and coalesce(current_setting('coupong.sync_used_amount', true), '') <> 'on' then
      raise exception '쓴 금액은 직접 바꿀 수 없어요'
        using errcode = '42501';
    end if;

    if new.type is distinct from old.type then
      if old.type = 'amount' and old.used_amount > 0 then
        raise exception '사용 내역이 있는 금액권은 종류를 바꿀 수 없어요';
      end if;
      if old.type = 'exchange' and old.used_by is not null then
        raise exception '사용한 쿠폰은 종류를 바꿀 수 없어요';
      end if;
    end if;

    if new.type = 'amount' and new.face_value < new.used_amount then
      raise exception '이미 쓴 금액보다 적게 바꿀 수 없어요';
    end if;

    return new;
  end;
$function$;

-- 금액권 사용: 쓴 금액을 기록하고 잔액에서 뺌. 반환: 사용 내역 id
create or replace function public.use_amount_coupon(
  p_coupon_id uuid,
  p_amount integer
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
  declare
    v_user_id uuid := (select auth.uid());
    v_coupon public.coupons;
    v_usage_id uuid;
  begin
    if v_user_id is null then
      raise exception '로그인이 필요해요';
    end if;

    -- 같은 쿠폰을 동시에 쓰는 요청은 차례로 처리
    select * into v_coupon
    from public.coupons
    where id = p_coupon_id
    for update;

    if v_coupon.id is null or not exists (
      select 1
      from public.user_organization
      where organization_id = v_coupon.organization_id
        and user_id = v_user_id
    ) then
      raise exception '쿠폰을 찾을 수 없어요';
    end if;

    if v_coupon.type <> 'amount' then
      raise exception '금액권이 아니에요';
    end if;

    if v_coupon.used_amount >= v_coupon.face_value then
      raise exception '남은 금액이 없는 쿠폰이에요';
    end if;

    if v_coupon.expire_at::date < (now() at time zone 'Asia/Seoul')::date then
      raise exception '기간이 지나 사용할 수 없는 쿠폰이에요';
    end if;

    if p_amount is null or p_amount < 1 then
      raise exception '사용한 금액을 입력해주세요';
    end if;

    if p_amount > v_coupon.face_value - v_coupon.used_amount then
      raise exception '남은 금액보다 많이 쓸 수 없어요';
    end if;

    insert into public.coupon_usages (coupon_id, user_id, amount)
    values (p_coupon_id, v_user_id, p_amount)
    returning id into v_usage_id;

    perform set_config('coupong.sync_used_amount', 'on', true);
    update public.coupons
    set used_amount = used_amount + p_amount
    where id = p_coupon_id;
    perform set_config('coupong.sync_used_amount', '', true);

    return v_usage_id;
  end;
$function$;

revoke execute on function public.use_amount_coupon(uuid, integer) from public, anon;
grant execute on function public.use_amount_coupon(uuid, integer) to authenticated;

-- 금액권 사용 기록 삭제 (내가 남긴 기록만): 쓴 금액만큼 잔액을 되돌림
create or replace function public.delete_coupon_usage(p_usage_id uuid)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
  declare
    v_user_id uuid := (select auth.uid());
    v_coupon_id uuid;
    v_usage public.coupon_usages;
  begin
    if v_user_id is null then
      raise exception '로그인이 필요해요';
    end if;

    select coupon_id into v_coupon_id
    from public.coupon_usages
    where id = p_usage_id;

    if v_coupon_id is null then
      raise exception '이미 지워진 사용 기록이에요';
    end if;

    -- 같은 쿠폰의 사용·삭제 요청은 차례로 처리
    perform 1
    from public.coupons
    where id = v_coupon_id
    for update;

    -- 잠근 뒤에 다시 확인 (그사이 다른 요청이 지웠을 수 있음)
    select * into v_usage
    from public.coupon_usages
    where id = p_usage_id;

    if v_usage.id is null then
      raise exception '이미 지워진 사용 기록이에요';
    end if;

    if v_usage.user_id is distinct from v_user_id then
      raise exception '내가 남긴 사용 기록만 지울 수 있어요';
    end if;

    delete from public.coupon_usages
    where id = p_usage_id;

    perform set_config('coupong.sync_used_amount', 'on', true);
    update public.coupons
    set used_amount = used_amount - v_usage.amount
    where id = v_coupon_id;
    perform set_config('coupong.sync_used_amount', '', true);
  end;
$function$;

revoke execute on function public.delete_coupon_usage(uuid) from public, anon;
grant execute on function public.delete_coupon_usage(uuid) to authenticated;

-- 되돌리기
-- drop function if exists public.delete_coupon_usage(uuid);
-- drop function if exists public.use_amount_coupon(uuid, integer);
-- drop trigger if exists sync_amount_coupon_used_by on public.coupons;
-- drop function if exists public.sync_amount_coupon_used_by();
-- (check_coupon_update_permission은 organization_role.sql의 정의로 다시 만듦)
-- drop table if exists public.coupon_usages;
-- alter table public.coupons drop constraint coupons_amount_check,
--   drop column type, drop column face_value, drop column used_amount;
-- drop type public.coupon_type;
