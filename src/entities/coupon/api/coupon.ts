import { getUser } from "@/entities/auth/api/auth";
import { AddCouponFormValues } from "@/features/add-coupon/config/schema";
import createBrowserClient from "@/shared/config/supabase/client";

import { InsertCouponType } from "./type";

const COUPON_TABLE = "coupons";
const COUPON_IMAGE_BUCKET = "coupon-image";

// ! 하나라도 실패하는 경우, rollback 처리 필요
export const addCoupon = async (coupon: AddCouponFormValues) => {
  const user = await getUser();
  const imagePath = await uploadCouponImage(coupon.imageFile[0]);
  const supabase = createBrowserClient();

  const { error: couponInsertError } = await supabase
    .from(COUPON_TABLE)
    .insert<InsertCouponType>({
      name: coupon.name,
      place: coupon.place,
      expire_at: coupon.expire_at,
      image_path: imagePath,
      uploaded_by: user.id,
    });

  if (couponInsertError) {
    console.error(
      `쿠폰 정보를 업로드하는 중 에러 발생: ${couponInsertError.message}`,
    );
    throw new Error("쿠폰 정보를 등록하는 중 오류가 발생했어요");
  }
};

export const uploadCouponImage = async (imageFile: File) => {
  const supabase = createBrowserClient();

  const { data, error: couponImageUploadError } = await supabase.storage
    .from(COUPON_IMAGE_BUCKET)
    .upload(`private/${crypto.randomUUID()}`, imageFile, {
      upsert: false,
    });

  if (couponImageUploadError) {
    console.error(
      `쿠폰 이미지를 업로드하는 중 에러 발생: ${couponImageUploadError.message}`,
    );
    throw new Error("쿠폰 이미지 업로드 중 오류가 발생했어요");
  }
  return data.path;
};
