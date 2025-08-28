import { getUser } from "@/entities/auth/api/auth";
import { OrganizationType } from "@/entities/organization/api/type";
import { AddCouponFormValues } from "@/features/add-coupon/config/schema";
import createBrowserClient from "@/shared/lib/supabase/client";

import { CouponType, InsertCouponType } from "./type";

const COUPON_TABLE = "coupons";
const COUPON_IMAGE_BUCKET = "coupon-image";

export const getCoupons = async ({
  organizationId,
  page,
  limit,
}: {
  organizationId: OrganizationType["id"];
  page: number;
  limit: number;
}) => {
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from(COUPON_TABLE)
    .select("*")
    .eq("organization_id", organizationId)
    .order("used_by", { nullsFirst: true })
    .order("expire_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    console.error("쿠폰 목록 조회 에러:", error);
    throw new Error("쿠폰 목록을 가져오는 중 오류가 발생했어요");
  }

  const { count, error: countError } = await supabase
    .from(COUPON_TABLE)
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  if (countError) {
    console.error("쿠폰 목록 카운트 조회 에러:", countError);
    throw new Error("쿠폰 목록의 개수를 가져오는 중 오류가 발생했어요");
  }
  return { data, hasNext: (count ?? 0) > page * limit };
};

export const getCoupon = async (couponId: CouponType["id"]) => {
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from(COUPON_TABLE)
    .select(
      `*,
      upload_username:users!uploaded_by(name),
      use_username:users!used_by(name)
      `,
    )
    .eq("id", couponId)
    .single();

  if (error) {
    console.error("쿠폰 상세 조회 에러:", error);
    throw new Error(`쿠폰 정보를 가져오는 중 오류가 발생했어요`);
  }
  return data;
};

// ! 하나라도 실패하는 경우, rollback 처리 필요
export const addCoupon = async (coupon: AddCouponFormValues) => {
  const user = await getUser();
  const imagePath = await uploadCouponImage(coupon.imageFile[0]);
  const supabase = createBrowserClient();

  const { error } = await supabase.from(COUPON_TABLE).insert<InsertCouponType>({
    name: coupon.name,
    place: coupon.place,
    expire_at: coupon.expire_at,
    image_path: imagePath,
    uploaded_by: user.id,
    organization_id: 1, // ! 하드 코딩
  });

  if (error) {
    console.error(`쿠폰 정보를 업로드하는 중 에러 발생: ${error.message}`);
    throw new Error("쿠폰 정보를 등록하는 중 오류가 발생했어요");
  }
};

export const uploadCouponImage = async (imageFile: File) => {
  const supabase = createBrowserClient();

  const { data, error } = await supabase.storage
    .from(COUPON_IMAGE_BUCKET)
    .upload(`private/${crypto.randomUUID()}`, imageFile, {
      upsert: false,
    });

  if (error) {
    console.error(`쿠폰 이미지를 업로드하는 중 에러 발생: ${error.message}`);
    throw new Error("쿠폰 이미지 업로드 중 오류가 발생했어요");
  }
  return data.path;
};

export const getSignedUrl = async (path: string) => {
  const supabase = createBrowserClient();

  const { data, error } = await supabase.storage
    .from(COUPON_IMAGE_BUCKET)
    .createSignedUrl(path, 60);

  if (error) {
    console.error(`쿠폰 이미지 URL 조회 중 에러 발생: ${error.message}`);
    throw new Error("쿠폰 이미지 URL 조회 중 오류가 발생했어요");
  }
  return data?.signedUrl;
};

export const changeCouponUse = async (couponId: CouponType["id"]) => {
  const user = await getUser();
  const supabase = createBrowserClient();

  const { error } = await supabase
    .from(COUPON_TABLE)
    .update({ used_by: user.id })
    .eq("id", couponId);

  if (error) {
    console.error(`쿠폰 사용 처리 중 에러 발생: ${error.message}`);
    throw new Error("쿠폰 사용 처리 중 오류가 발생했어요");
  }
};
