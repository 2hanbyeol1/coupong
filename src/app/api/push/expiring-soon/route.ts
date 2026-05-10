import { NextResponse } from "next/server";

import { filterUsersByPreference } from "@/shared/lib/push/prefs";
import { sendPushToUsers } from "@/shared/lib/push/send";
import createAdminClient from "@/shared/lib/supabase/admin";

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// KST 자정 기준 [내일 00:00, 모레 00:00) 구간을 UTC ISO 로 환산
function getTomorrowKstWindow() {
  const nowMs = Date.now();
  const kstShifted = nowMs + KST_OFFSET_MS;
  const kstTodayMidnightShifted =
    Math.floor(kstShifted / ONE_DAY_MS) * ONE_DAY_MS;
  const start = new Date(kstTodayMidnightShifted + ONE_DAY_MS - KST_OFFSET_MS);
  const end = new Date(
    kstTodayMidnightShifted + 2 * ONE_DAY_MS - KST_OFFSET_MS,
  );
  return { start: start.toISOString(), end: end.toISOString() };
}

export async function POST(request: Request) {
  const secret = request.headers.get("x-webhook-secret");
  if (!secret || secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { start, end } = getTomorrowKstWindow();

  const { data: coupons, error } = await supabase
    .from("coupons")
    .select("id, name, place, organization_id")
    .gte("expire_at", start)
    .lt("expire_at", end)
    .is("used_by", null)
    .is("expiry_notified_at", null);

  if (error) {
    console.error("쿠폰 조회 실패", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!coupons || coupons.length === 0) {
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

  let totalSent = 0;
  const notifiedCouponIds: string[] = [];

  for (const coupon of coupons) {
    if (!coupon.organization_id) continue;
    const userIds = orgMembers.get(coupon.organization_id) ?? [];
    if (userIds.length === 0) continue;

    const recipientIds = await filterUsersByPreference(
      userIds,
      "expiring_soon",
    );
    if (recipientIds.length === 0) {
      // 전원 수신 거부여도 중복 발송 방지를 위해 처리한 것으로 마킹
      notifiedCouponIds.push(coupon.id);
      continue;
    }

    const result = await sendPushToUsers(recipientIds, {
      title: "쿠폰 마감이 1일 남았어요",
      body: `[${coupon.place}] ${coupon.name}`,
      url: "/",
    });
    totalSent += result.sent;
    notifiedCouponIds.push(coupon.id);
  }

  if (notifiedCouponIds.length > 0) {
    await supabase
      .from("coupons")
      .update({ expiry_notified_at: new Date().toISOString() })
      .in("id", notifiedCouponIds);
  }

  return NextResponse.json({
    ok: true,
    processed: coupons.length,
    sent: totalSent,
  });
}
