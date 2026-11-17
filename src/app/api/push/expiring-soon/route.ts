import { NextResponse } from "next/server";

import {
  getRemainingAmount,
  isAmountCoupon,
} from "@/entities/coupon/lib/amount";
import {
  EXPIRY_REMINDER_DAYS,
  ExpiryReminderDay,
  isExpiryReminderDay,
} from "@/shared/config/notification";
import { ROUTES } from "@/shared/config/routes";
import { filterUsersByExpiryReminder } from "@/shared/lib/push/prefs";
import { sendPushToUsers } from "@/shared/lib/push/send";
import createAdminClient from "@/shared/lib/supabase/admin";
import { formatWon } from "@/shared/lib/util/money";

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/** 오늘(KST) 날짜에서 days일 뒤의 날짜 (YYYY-MM-DD) */
function getKstDate(days = 0) {
  return new Date(Date.now() + KST_OFFSET_MS + days * ONE_DAY_MS)
    .toISOString()
    .slice(0, 10);
}

/** 유효기간이 오늘(KST)로부터 며칠 남았는지 (expire_at은 시간 없이 날짜만 저장됨) */
function getDaysBefore(expireAt: string) {
  const today = Date.parse(getKstDate());
  const expireDate = Date.parse(expireAt.slice(0, 10));
  return Math.round((expireDate - today) / ONE_DAY_MS);
}

// 매일 한 번(pg_cron) 호출: 마감 7일·3일·1일 전인 쿠폰을 그 날 알림을 고른 그룹원에게 보냄
export async function POST(request: Request) {
  const secret = request.headers.get("x-webhook-secret");
  if (!secret || secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const maxDays = Math.max(...EXPIRY_REMINDER_DAYS);

  const { data: candidates, error } = await supabase
    .from("coupons")
    .select(
      "id, name, place, organization_id, expire_at, type, face_value, used_amount",
    )
    .gte("expire_at", getKstDate(1))
    .lt("expire_at", getKstDate(maxDays + 1))
    .is("used_by", null);

  if (error) {
    console.error("쿠폰 조회 실패", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 알림 보낼 날(7·3·1일 전)에 해당하는 쿠폰만
  const dueCoupons = (candidates ?? []).flatMap((coupon) => {
    const daysBefore = getDaysBefore(coupon.expire_at);
    return isExpiryReminderDay(daysBefore) ? [{ ...coupon, daysBefore }] : [];
  });

  if (dueCoupons.length === 0) {
    return NextResponse.json({ ok: true, processed: 0 });
  }

  // 이미 보낸 알림 (같은 쿠폰·같은 날·같은 유효기간)은 건너뜀
  const { data: sentRows, error: sentErr } = await supabase
    .from("coupon_expiry_notifications")
    .select("coupon_id, days_before, expire_at")
    .in(
      "coupon_id",
      dueCoupons.map((coupon) => coupon.id),
    );

  if (sentErr) {
    console.error("보낸 알림 조회 실패", sentErr);
    return NextResponse.json({ error: sentErr.message }, { status: 500 });
  }

  const sentKey = (couponId: string, daysBefore: number, expireAt: string) =>
    `${couponId}:${daysBefore}:${expireAt.slice(0, 10)}`;
  const sent = new Set(
    (sentRows ?? []).map((row) =>
      sentKey(row.coupon_id, row.days_before, row.expire_at),
    ),
  );
  const coupons = dueCoupons.filter(
    (coupon) =>
      !sent.has(sentKey(coupon.id, coupon.daysBefore, coupon.expire_at)),
  );

  if (coupons.length === 0) {
    return NextResponse.json({ ok: true, processed: 0 });
  }

  const orgIds = Array.from(
    new Set(
      coupons
        .map((c) => c.organization_id)
        .filter((id): id is string => id !== null),
    ),
  );

  const { data: memberships, error: memErr } = await supabase
    .from("user_organization")
    .select("user_id, organization_id")
    .in("organization_id", orgIds);

  if (memErr) {
    console.error("멤버 조회 실패", memErr);
    return NextResponse.json({ error: memErr.message }, { status: 500 });
  }

  const orgMembers = new Map<string, string[]>();
  for (const m of memberships ?? []) {
    const arr = orgMembers.get(m.organization_id) ?? [];
    arr.push(m.user_id);
    orgMembers.set(m.organization_id, arr);
  }

  // 같은 그룹·같은 날이면 받는 사람이 같으므로 한 번만 조회
  const recipientsCache = new Map<string, Promise<string[]>>();
  const getRecipients = (orgId: string, daysBefore: ExpiryReminderDay) => {
    const key = `${orgId}:${daysBefore}`;
    if (!recipientsCache.has(key)) {
      recipientsCache.set(
        key,
        filterUsersByExpiryReminder(orgMembers.get(orgId) ?? [], daysBefore),
      );
    }
    return recipientsCache.get(key)!;
  };

  let totalSent = 0;
  const notified: {
    coupon_id: string;
    days_before: number;
    expire_at: string;
  }[] = [];

  for (const coupon of coupons) {
    if (!coupon.organization_id) continue;

    const recipientIds = await getRecipients(
      coupon.organization_id,
      coupon.daysBefore,
    );
    // 받는 사람이 없어도 다시 확인하지 않도록 보낸 것으로 기록
    notified.push({
      coupon_id: coupon.id,
      days_before: coupon.daysBefore,
      expire_at: coupon.expire_at,
    });
    if (recipientIds.length === 0) continue;

    const result = await sendPushToUsers(recipientIds, {
      title: `쿠폰 마감이 ${coupon.daysBefore}일 남았어요`,
      // 금액권은 남은 금액을 함께 알려줌
      body: isAmountCoupon(coupon)
        ? `[${coupon.place}] ${coupon.name} (${formatWon(getRemainingAmount(coupon))} 남음)`
        : `[${coupon.place}] ${coupon.name}`,
      url: ROUTES.COUPON_DETAIL(coupon.id),
    });
    totalSent += result.sent;
  }

  if (notified.length > 0) {
    const { error: insertErr } = await supabase
      .from("coupon_expiry_notifications")
      .upsert(notified, { ignoreDuplicates: true });
    if (insertErr) console.error("보낸 알림 기록 실패", insertErr);
  }

  return NextResponse.json({
    ok: true,
    processed: coupons.length,
    sent: totalSent,
  });
}
