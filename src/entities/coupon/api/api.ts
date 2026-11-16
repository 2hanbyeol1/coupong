import { getAuthUser } from "@/entities/auth/api/api";
import { OrganizationType } from "@/entities/organization/api/type";
import { AddCouponFormValues } from "@/features/add-coupon/lib/schema";
import { NOT_FOUND_ERROR_CODE } from "@/shared/lib/constants/error-code";
import createBrowserClient from "@/shared/lib/supabase/client";
import { getTodayDateInputValue } from "@/shared/lib/util/date";

import { CouponListStatus } from "../lib/status";

import { CouponType, InsertCouponType } from "./type";

const COUPON_TABLE = "coupons";
const COUPON_IMAGE_BUCKET = "coupon-image";
// 서명 URL이 바뀌면 같은 이미지도 다시 받아야 해서 길게 유지
export const SIGNED_URL_EXPIRES_IN = 60 * 60; // 1 hour (seconds)

/** 정규식 특수문자를 글자 그대로 찾도록 이스케이프 */
const escapeRegExp = (value: string) =>
  value.replace(/[\\^$.|?*+()[\]{}]/g, "\\$&");

/** PostgREST 필터 값을 큰따옴표로 감쌈 (쉼표·괄호·점이 있어도 필터 문법이 깨지지 않게) */
const quoteFilterValue = (value: string) =>
  `"${value.replace(/["\\]/g, "\\$&")}"`;

export interface CouponListFilter {
  organizationId: OrganizationType["id"];
  status: CouponListStatus;
  /** 사용처(place)나 이름(name)에 포함된 쿠폰만 (대소문자 무시) */
  keyword?: string;
}

/** 목록 탭·검색어 조건에 맞는 쿠폰 조회 (head: 개수만) */
const selectCoupons = (
  { organizationId, status, keyword }: CouponListFilter,
  { head = false }: { head?: boolean } = {},
) => {
  const supabase = createBrowserClient();

  let query = supabase
    .from(COUPON_TABLE)
    .select("*", { count: "exact", head })
    .eq("organization_id", organizationId);

  // 오늘이 유효기간인 쿠폰은 아직 쓸 수 있음 (getExpired와 같은 기준, 기기 날짜 기준)
  const today = getTodayDateInputValue();
  query =
    status === "available"
      ? query.is("used_by", null).gte("expire_at", today)
      : query.or(`used_by.not.is.null,expire_at.lt.${today}`);

  if (keyword) {
    // ilike는 PostgREST가 값의 *를 %로 바꿔 버려 *를 글자 그대로 찾을 수 없으므로,
    // 키워드를 그대로 찾는 정규식(imatch: 대소문자 무시)으로 검색
    const pattern = quoteFilterValue(escapeRegExp(keyword));
    query = query.or(`place.imatch.${pattern},name.imatch.${pattern}`);
  }

  return query;
};

export const getCoupons = async ({
  page,
  limit,
  ...filter
}: CouponListFilter & { page: number; limit: number }) => {
  // 사용 가능: 빨리 써야 하는 쿠폰부터 / 지난 쿠폰: 최근에 만료된 쿠폰부터
  const isAvailable = filter.status === "available";

  const { data, count, error } = await selectCoupons(filter)
    .order("expire_at", { ascending: isAvailable })
    .order("created_at", { ascending: false })
    // 여러 장을 한 번에 등록하면 만료일·등록 시각이 같아 순서가 정해지지 않음
    // → 페이지마다 순서가 달라져 같은 쿠폰이 중복되거나 빠지므로 id로 순서를 고정
    .order("id")
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    console.error("쿠폰 목록 조회 에러:", error);
    throw new Error("쿠폰 목록을 가져오는 중 오류가 발생했어요");
  }
  return { data, hasNext: (count ?? 0) > page * limit };
};

export const getCouponCount = async (filter: CouponListFilter) => {
  const { count, error } = await selectCoupons(filter, { head: true });

  if (error) {
    console.error("쿠폰 개수 조회 에러:", error);
    throw new Error("쿠폰 개수를 가져오는 중 오류가 발생했어요");
  }
  return count ?? 0;
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
    if (error.code === NOT_FOUND_ERROR_CODE) return null;

    console.error("쿠폰 상세 조회 에러:", error);
    throw new Error(`쿠폰 정보를 가져오는 중 오류가 발생했어요`);
  }
  return data;
};

// 그룹 전체 쿠폰의 (사용처, 이름) 조합별 사용 횟수 (입력 추천용)
// 많이 쓴 순 → 최근에 쓴 순으로 정렬되어 옴
export interface SearchCouponSuggestionsParams {
  organizationId: OrganizationType["id"];
  /** 검색할 항목 */
  field: "place" | "name";
  /** 검색어. 비어 있으면 많이 쓴 순 상위 값을 반환 */
  query?: string;
  /** 쿠폰 이름 검색 시 이 사용처에서 쓴 이름을 먼저 */
  place?: string;
  /** true면 place에서 쓴 적 있는 이름(과 sessionValues)만 */
  placeOnly?: boolean;
  /** 아직 저장 전인, 이번 등록에서 입력한 값 (후보에 포함되고 먼저 나옴) */
  sessionValues?: string[];
  limit?: number;
}

/**
 * 그룹 쿠폰에서 사용처·쿠폰 이름 추천 검색
 * 중복 제거(띄어쓰기·대소문자 무시)·검색·정렬은 서버(search_coupon_suggestions)에서 처리
 */
export const searchCouponSuggestions = async ({
  organizationId,
  field,
  query = "",
  place = "",
  sessionValues = [],
  limit,
  placeOnly = false,
}: SearchCouponSuggestionsParams) => {
  const supabase = createBrowserClient();

  const { data, error } = await supabase.rpc("search_coupon_suggestions", {
    p_organization_id: organizationId,
    p_field: field,
    p_query: query,
    p_place: place,
    p_session_values: sessionValues,
    p_limit: limit,
    p_place_only: placeOnly,
  });

  if (error) {
    console.error("쿠폰 추천 검색 에러:", error);
    throw new Error("쿠폰 추천 목록을 가져오는 중 오류가 발생했어요");
  }
  return data.map(({ value }) => value);
};

// ! 하나라도 실패하는 경우, rollback 처리 필요
/** 쿠폰 사진 하나의 업로드 상태 */
export type CouponUploadStatus = "pending" | "uploading" | "done" | "error";

/** 사진 일부를 올리지 못해 등록을 멈췄을 때 (먼저 올라간 사진은 정리됨) */
export class CouponImageUploadError extends Error {
  constructor(public failedCount: number) {
    super(`${failedCount}개 쿠폰 사진을 올리지 못했어요`);
    this.name = "CouponImageUploadError";
  }
}

/** 사진을 지움 (실패해도 던지지 않고 false만 반환) */
const removeCouponImages = async (paths: string[]) => {
  if (paths.length === 0) return true;
  const supabase = createBrowserClient();
  const { error } = await supabase.storage
    .from(COUPON_IMAGE_BUCKET)
    .remove(paths);
  if (error) {
    console.error(
      `올라간 쿠폰 이미지를 정리하는 중 에러 발생: ${error.message}`,
    );
    return false;
  }
  return true;
};

/**
 * 그룹의 쿠폰 사진을 모두 지움 (마지막 그룹원이 나가 그룹이 삭제되기 전에 호출)
 * 그룹이 삭제되면 사진에 접근할 권한도 사라지므로 미리 지움. 실패해도 나가기는 계속함
 */
export const removeOrganizationCouponImages = async (
  orgId: OrganizationType["id"],
) => {
  const supabase = createBrowserClient();
  const bucket = supabase.storage.from(COUPON_IMAGE_BUCKET);
  const PAGE_SIZE = 1000;

  // 지우면 목록이 줄어드므로 매번 처음부터 다시 조회
  while (true) {
    const { data, error } = await bucket.list(orgId, { limit: PAGE_SIZE });
    if (error) {
      console.error(`그룹 쿠폰 사진 조회 중 에러 발생: ${error.message}`);
      return;
    }
    if (data.length === 0) return;

    const removed = await removeCouponImages(
      data.map((file) => `${orgId}/${file.name}`),
    );
    // 지우지 못하면 같은 목록이 계속 조회되므로 멈춤
    if (!removed || data.length < PAGE_SIZE) return;
  }
};

export const addCoupons = async (
  formValues: AddCouponFormValues,
  orgId: OrganizationType["id"],
  /** 사진별 업로드 상태가 바뀔 때마다 호출 */
  onUploadStatusChange?: (index: number, status: CouponUploadStatus) => void,
) => {
  const user = await getAuthUser();
  const supabase = createBrowserClient();

  const files = Array.from(formValues.imageFile as FileList);
  const results = await Promise.allSettled(
    files.map(async (file, index) => {
      onUploadStatusChange?.(index, "uploading");
      try {
        const path = await uploadCouponImage(file, orgId);
        onUploadStatusChange?.(index, "done");
        return path;
      } catch (error) {
        onUploadStatusChange?.(index, "error");
        throw error;
      }
    }),
  );

  const imagePaths = results.flatMap((result) =>
    result.status === "fulfilled" ? [result.value] : [],
  );
  const failedCount = results.length - imagePaths.length;
  // 하나라도 실패하면 먼저 올라간 사진을 지워, 다시 시도할 때 사진이 중복으로 쌓이지 않게 함
  if (failedCount > 0) {
    await removeCouponImages(imagePaths);
    throw new CouponImageUploadError(failedCount);
  }

  const rows = formValues.coupons.map((coupon, index) => ({
    name: coupon.name,
    place: coupon.place,
    expire_at: coupon.expire_at,
    image_path: imagePaths[index],
    uploaded_by: user.id,
    organization_id: orgId,
  })) satisfies InsertCouponType[];

  const { error } = await supabase.from(COUPON_TABLE).insert(rows);

  if (error) {
    console.error(`쿠폰 정보를 업로드하는 중 에러 발생: ${error.message}`);
    await removeCouponImages(imagePaths);
    throw new Error("쿠폰 정보를 등록하는 중 오류가 발생했어요");
  }
};

export const uploadCouponImage = async (
  imageFile: File,
  orgId: OrganizationType["id"],
) => {
  const supabase = createBrowserClient();

  const { data, error } = await supabase.storage
    .from(COUPON_IMAGE_BUCKET)
    .upload(`${orgId}/${crypto.randomUUID()}`, imageFile, {
      upsert: false,
    });

  if (error) {
    console.error(`쿠폰 이미지를 업로드하는 중 에러 발생: ${error.message}`);
    throw new Error("쿠폰 이미지 업로드 중 오류가 발생했어요");
  }
  return data.path;
};

export const getImageSignedUrl = async (path: string) => {
  const supabase = createBrowserClient();

  const { data, error } = await supabase.storage
    .from(COUPON_IMAGE_BUCKET)
    .createSignedUrl(path, SIGNED_URL_EXPIRES_IN);

  if (error) {
    console.error(`쿠폰 이미지 URL 조회 중 에러 발생: ${error.message}`);
    throw new Error("쿠폰 이미지 URL 조회 중 오류가 발생했어요");
  }
  return data?.signedUrl;
};

export const changeCouponUse = async (couponId: CouponType["id"]) => {
  const user = await getAuthUser();
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

/** 내가 사용 처리한 쿠폰을 다시 사용 전으로 되돌림 */
export const cancelCouponUse = async (couponId: CouponType["id"]) => {
  const user = await getAuthUser();
  const supabase = createBrowserClient();

  // 그사이 다른 사람이 바꾼 쿠폰은 건드리지 않도록 내가 사용한 경우에만 되돌림
  const { data, error } = await supabase
    .from(COUPON_TABLE)
    .update({ used_by: null })
    .eq("id", couponId)
    .eq("used_by", user.id)
    .select("id");

  if (error) {
    console.error(`쿠폰 사용 취소 중 에러 발생: ${error.message}`);
    throw new Error("쿠폰 사용을 되돌리는 중 오류가 발생했어요");
  }
  if (data.length === 0) {
    throw new Error("이미 바뀐 쿠폰이라 되돌릴 수 없어요");
  }
};

export const updateCoupon = async (
  couponId: CouponType["id"],
  changes: Partial<Pick<CouponType, "name" | "place" | "expire_at">>,
) => {
  const supabase = createBrowserClient();

  const { error } = await supabase
    .from(COUPON_TABLE)
    .update(changes)
    .eq("id", couponId);

  if (error) {
    console.error(`쿠폰 수정 중 에러 발생: ${error.message}`);
    throw new Error("쿠폰 수정 중 오류가 발생했어요");
  }
};

export const deleteCoupon = async (couponId: CouponType["id"]) => {
  const supabase = createBrowserClient();

  const { data: coupon, error: fetchError } = await supabase
    .from(COUPON_TABLE)
    .select("image_path")
    .eq("id", couponId)
    .single();

  if (fetchError) {
    console.error(`쿠폰 조회 중 에러 발생: ${fetchError.message}`);
    throw new Error("쿠폰 정보를 가져오는 중 오류가 발생했어요");
  }

  const { data: deleted, error: deleteError } = await supabase
    .from(COUPON_TABLE)
    .delete()
    .eq("id", couponId)
    .select("id");

  if (deleteError) {
    console.error(`쿠폰 삭제 중 에러 발생: ${deleteError.message}`);
    throw new Error("쿠폰 삭제 중 오류가 발생했어요");
  }
  // 권한이 없으면 RLS가 에러 없이 0건을 삭제하므로, 사진을 지우기 전에 확인
  if (deleted.length === 0) {
    throw new Error("쿠폰을 삭제할 권한이 없어요");
  }

  if (coupon.image_path) {
    const { error: storageError } = await supabase.storage
      .from(COUPON_IMAGE_BUCKET)
      .remove([coupon.image_path]);

    if (storageError) {
      console.error(`쿠폰 이미지 삭제 중 에러 발생: ${storageError.message}`);
    }
  }
};
