-- 쿠폰 등록 시 사용처·쿠폰 이름 추천 검색
--
-- 그룹 쿠폰에서 p_field(place | name) 값을 띄어쓰기·대소문자를 무시한 기준으로 중복 제거하고,
-- p_query가 포함된 값을 p_limit개까지 반환. p_query가 비어 있으면 검색 없이 상위 값을 반환
--
-- - 대표 표기: 그룹에서 가장 많이 쓴 표기 (그룹에 없는 값이면 이번 등록에서 입력한 표기)
-- - 정렬: 검색어로 시작 → 이번 등록에서 입력한 값 → (name일 때) p_place에서 쓴 횟수 → 전체 사용 횟수 → 최근 등록
-- - 입력값과 완전히 같은 값은 제외
-- - p_place_only: (name일 때) p_place에서 쓴 적 있는 이름과 이번 등록에서 입력한 값만 반환
-- - security invoker: 호출한 사용자 권한(RLS)으로 실행되므로 속한 그룹의 쿠폰만 검색됨
drop function if exists public.get_coupon_suggestions(uuid);
drop function if exists public.search_coupon_suggestions(uuid, text, text, text, text[], integer);

create or replace function public.search_coupon_suggestions(
  p_organization_id uuid,
  p_field text,
  p_query text default '',
  p_place text default '',
  p_session_values text[] default '{}',
  p_limit integer default 5,
  p_place_only boolean default false
)
returns table (
  value text,
  use_count bigint,
  last_used_at timestamptz
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_query text := lower(regexp_replace(coalesce(p_query, ''), '\s', '', 'g'));
  v_place text := lower(regexp_replace(coalesce(p_place, ''), '\s', '', 'g'));
begin
  if p_field is null or p_field not in ('place', 'name') then
    raise exception 'p_field는 place 또는 name이어야 합니다' using errcode = '22023';
  end if;

  return query
  with candidates as (
    select
      case when p_field = 'place' then c.place else c.name end as raw_value,
      lower(regexp_replace(c.place, '\s', '', 'g')) as place_key,
      c.created_at,
      false as is_session
    from public.coupons c
    where c.organization_id = p_organization_id
    union all
    select s, null, null, true
    from unnest(coalesce(p_session_values, '{}'::text[])) as s
  ),
  keyed as (
    select
      cd.*,
      lower(regexp_replace(cd.raw_value, '\s', '', 'g')) as norm_key
    from candidates cd
  ),
  grouped as (
    select
      k.norm_key,
      coalesce(
        mode() within group (order by k.raw_value) filter (where not k.is_session),
        min(k.raw_value) filter (where k.is_session)
      ) as rep_value,
      count(*) filter (where not k.is_session) as total_count,
      count(*) filter (
        where not k.is_session
          and p_field = 'name'
          and v_place <> ''
          and k.place_key = v_place
      ) as place_count,
      max(k.created_at) as last_created_at,
      bool_or(k.is_session) as has_session
    from keyed k
    where k.norm_key <> ''
      and (v_query = '' or strpos(k.norm_key, v_query) > 0)
    group by k.norm_key
  )
  select g.rep_value, g.total_count, g.last_created_at
  from grouped g
  where g.rep_value <> coalesce(p_query, '')
    and (not coalesce(p_place_only, false) or g.place_count > 0 or g.has_session)
  order by
    (v_query <> '' and starts_with(g.norm_key, v_query)) desc,
    g.has_session desc,
    g.place_count desc,
    g.total_count desc,
    g.last_created_at desc nulls last,
    g.rep_value
  limit least(greatest(coalesce(p_limit, 5), 1), 20);
end;
$$;

revoke execute on function public.search_coupon_suggestions(uuid, text, text, text, text[], integer, boolean) from public, anon;
grant execute on function public.search_coupon_suggestions(uuid, text, text, text, text[], integer, boolean) to authenticated;
