-- 관리자는 사용한 쿠폰도 종류(교환권 / 금액권)를 바꿀 수 있음
-- 종류를 바꾸면 사용 상태를 새 종류에 맞게 옮김
--   사용한 교환권 → 금액권: 쓴 사람이 전액을 쓴 기록 1건을 남겨 다 쓴 금액권
--   사용 내역이 있는 금액권 → 교환권: 사용 내역은 지우고,
--     다 썼으면 마지막으로 쓴 사람이 쓴 교환권, 남은 금액이 있었으면 안 쓴 교환권

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

    -- 사용한 쿠폰의 종류는 관리자만 바꿈 (사용 상태는 sync_amount_coupon_used_by에서 옮김)
    if new.type is distinct from old.type
      and (
        (old.type = 'amount' and old.used_amount > 0)
        or (old.type = 'exchange' and old.used_by is not null)
      )
      and not public.is_organization_admin(old.organization_id) then
      raise exception '사용한 쿠폰의 종류는 관리자만 바꿀 수 있어요';
    end if;

    if new.type = 'amount' and new.face_value < new.used_amount then
      raise exception '이미 쓴 금액보다 적게 바꿀 수 없어요';
    end if;

    return new;
  end;
$function$;

-- 종류를 바꿀 때 사용 내역을 쓰고 지워야 해서 security definer (coupon_usages는 직접 쓰기 정책이 없음)
-- 트리거는 이름 순서로 실행되므로 check_coupon_update_permission(권한 검사) 다음에 실행됨
create or replace function public.sync_amount_coupon_used_by()
returns trigger
language plpgsql
security definer
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

    -- 종류를 바꾸면 사용 상태를 새 종류에 맞게 옮김
    if new.type is distinct from old.type then
      if new.type = 'amount' then
        if new.face_value is null then
          raise exception '금액권의 금액을 입력해주세요';
        end if;
        if old.used_by is not null then
          -- 사용한 교환권 → 쓴 사람이 전액을 쓴 다 쓴 금액권
          insert into public.coupon_usages (coupon_id, user_id, amount)
          values (new.id, old.used_by, new.face_value);
          new.used_amount := new.face_value;
          new.used_by := old.used_by;
        else
          new.used_amount := 0;
          new.used_by := null;
        end if;
      else
        -- 금액권 → 교환권: 금액 사용 내역은 지우고, 다 썼을 때만 쓴 교환권
        delete from public.coupon_usages where coupon_id = new.id;
        new.used_by := case
          when old.used_amount >= old.face_value then old.used_by
          else null
        end;
        new.used_amount := 0;
      end if;
      return new;
    end if;

    if new.type <> 'amount' then
      return new;
    end if;

    if new.used_amount >= new.face_value then
      -- 이미 다 쓴 상태였으면 그대로, 이번에 0원이 됐으면 마지막으로 쓴 사람
      if old.used_amount < old.face_value or new.used_by is null then
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
