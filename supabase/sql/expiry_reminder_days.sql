-- 쿠폰 마감 알림을 7일·3일·1일 전 중에서 골라 받기
-- 1. user_notification_preferences.expiring_soon_days: 알림 받을 날 (기본은 지금처럼 1일 전만)
--    마감 알림을 끄는 건 expiring_soon(false)으로, 이 값은 비울 수 없음
-- 2. coupon_expiry_notifications: 쿠폰마다 며칠 전 알림을 보냈는지 기록 (중복 발송 방지)
--    유효기간을 바꾸면 새 날짜 기준으로 다시 알림이 가도록 그때의 유효기간도 함께 기록
--    서버(service_role)만 쓰므로 RLS를 켜고 정책은 두지 않음
-- 3. 기존 coupons.expiry_notified_at(1일 전 알림만 기록)은 새 테이블로 옮기고 더 이상 쓰지 않음

alter table public.user_notification_preferences
  add column expiring_soon_days smallint[] not null default '{1}'
  constraint expiring_soon_days_valid
    check (cardinality(expiring_soon_days) > 0 and expiring_soon_days <@ '{1,3,7}');

create table public.coupon_expiry_notifications (
  coupon_id uuid not null references public.coupons (id) on delete cascade,
  days_before smallint not null,
  expire_at timestamp not null,
  sent_at timestamptz not null default now(),
  primary key (coupon_id, days_before, expire_at)
);

alter table public.coupon_expiry_notifications enable row level security;

insert into public.coupon_expiry_notifications (coupon_id, days_before, expire_at, sent_at)
select id, 1, expire_at, expiry_notified_at
from public.coupons
where expiry_notified_at is not null
on conflict do nothing;

-- 되돌리기
-- drop table if exists public.coupon_expiry_notifications;
-- alter table public.user_notification_preferences drop column if exists expiring_soon_days;
