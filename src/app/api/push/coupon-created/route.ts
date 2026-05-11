import { NextResponse } from "next/server";

import { filterUsersByPreference } from "@/shared/lib/push/prefs";
import { sendPushToUsers } from "@/shared/lib/push/send";
import createAdminClient from "@/shared/lib/supabase/admin";

type CouponRecord = {
  id: string;
  name: string;
  place: string;
  organization_id: string | null;
  uploaded_by: string;
  expire_at: string;
};

type WebhookPayload = {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema: string;
  record: CouponRecord;
  old_record: CouponRecord | null;
};

export async function POST(request: Request) {
  const secret = request.headers.get("x-webhook-secret");
  if (!secret || secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as WebhookPayload;
  if (payload.type !== "INSERT" || payload.table !== "coupons") {
    return NextResponse.json({ skipped: true });
  }

  const coupon = payload.record;
  if (!coupon.organization_id) {
    return NextResponse.json({ skipped: "no organization" });
  }

  const supabase = createAdminClient();
  const { data: members, error } = await supabase
    .from("user_organization")
    .select("user_id")
    .eq("organization_id", coupon.organization_id);

  if (error) {
    console.error("멤버 조회 실패", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const memberIds = (members ?? [])
    .map((m) => m.user_id)
    .filter((id) => id !== coupon.uploaded_by);

  const recipientIds = await filterUsersByPreference(
    memberIds,
    "coupon_created",
  );

  const [{ data: uploader }, { data: organization }] = await Promise.all([
    supabase
      .from("users")
      .select("name")
      .eq("user_id", coupon.uploaded_by)
      .single(),
    supabase
      .from("organizations")
      .select("name")
      .eq("id", coupon.organization_id)
      .single(),
  ]);

  const uploaderName = uploader?.name ?? "누군가";
  const organizationName = organization?.name ?? "그룹";

  const result = await sendPushToUsers(recipientIds, {
    title: `${uploaderName}님이 ${organizationName}에 새로운 쿠폰을 등록했어요`,
    body: `[${coupon.place}] ${coupon.name}`,
    url: "/",
  });

  return NextResponse.json({ ok: true, ...result });
}
