"use client";
import { ReactNode } from "react";
import { AlertCircle, Check, LoaderCircle } from "lucide-react";
import Image from "next/image";

import { CouponUploadStatus } from "@/entities/coupon/api/api";
import { COUPON_IMAGE_ASPECT_CLASS } from "@/entities/coupon/constants";
import { cn } from "@/shared/lib/util/cn";
import { formatKoreanDate } from "@/shared/lib/util/date";
import { BottomSheet, Button } from "@/shared/ui";

import { CouponInfoFormValues } from "../../lib/schema";

/** confirm: 등록 전 확인, submitting: 등록 중, error: 등록 실패 */
export type RegisterPhase = "confirm" | "submitting" | "error";

interface RegisterConfirmSheetProps {
  open: boolean;
  phase: RegisterPhase;
  coupons: CouponInfoFormValues[];
  imagePreviews: string[];
  uploadStatuses: CouponUploadStatus[];
  /** 실패했을 때 안내 문구 */
  errorMessage?: string;
  /** 등록할 그룹을 보여주고 바꾸는 영역 */
  organizationField?: ReactNode;
  onClose: () => void;
  onSubmit: () => void;
}

interface CouponGroup {
  key: string;
  coupon: CouponInfoFormValues;
  thumbnail: string | undefined;
  count: number;
}

/** 사용처·이름·유효 기간이 모두 같은 쿠폰은 한 줄로 묶음 */
const groupCoupons = (
  coupons: CouponInfoFormValues[],
  imagePreviews: string[],
): CouponGroup[] => {
  const groups = new Map<string, CouponGroup>();
  coupons.forEach((coupon, index) => {
    const key = `${coupon.place}|${coupon.name}|${coupon.expire_at}`;
    const group = groups.get(key);
    if (group) group.count += 1;
    else
      groups.set(key, {
        key,
        coupon,
        thumbnail: imagePreviews[index],
        count: 1,
      });
  });
  return [...groups.values()];
};

function Thumbnail({ url, alt }: { url?: string; alt: string }) {
  return (
    <div
      className={cn(
        "border-light relative h-16 shrink-0 overflow-hidden rounded-md border-2",
        COUPON_IMAGE_ASPECT_CLASS,
      )}
    >
      {url && <Image src={url} alt={alt} fill className="object-contain" />}
    </div>
  );
}

function CouponSummary({ coupon }: { coupon: CouponInfoFormValues }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="truncate text-[15px] font-medium">
        [{coupon.place}] {coupon.name}
      </span>
      <span className="text-dark text-sm">
        {formatKoreanDate(coupon.expire_at)}까지
      </span>
    </div>
  );
}

function UploadStatusIcon({ status }: { status: CouponUploadStatus }) {
  if (status === "done")
    return (
      <span className="bg-primary-fill flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white">
        <Check size={14} strokeWidth={3} aria-label="완료" />
      </span>
    );
  if (status === "uploading")
    return (
      <LoaderCircle
        size={22}
        className="text-primary shrink-0 animate-spin"
        aria-label="올리는 중"
      />
    );
  if (status === "error")
    return (
      <AlertCircle
        size={22}
        className="text-error shrink-0"
        aria-label="실패"
      />
    );
  return (
    <span
      className="bg-light h-6 w-6 shrink-0 rounded-full"
      aria-label="대기 중"
    />
  );
}

/**
 * 등록 확인 → 등록 중 → (실패 시) 다시 시도를 한 시트에서 보여줌
 * 등록 중에는 닫거나 취소할 수 없음
 */
function RegisterConfirmSheet({
  open,
  phase,
  coupons,
  imagePreviews,
  uploadStatuses,
  errorMessage,
  organizationField,
  onClose,
  onSubmit,
}: RegisterConfirmSheetProps) {
  const total = coupons.length;
  const isSubmitting = phase === "submitting";
  const doneCount = uploadStatuses.filter((status) => status === "done").length;

  const title = {
    confirm: "이대로 등록할까요?",
    submitting: "쿠폰을 등록하고 있어요",
    error: errorMessage ?? "쿠폰을 등록하지 못했어요",
  }[phase];

  const footer = (
    <div className="flex gap-2">
      <Button
        color="light"
        size="lg"
        onClick={onClose}
        disabled={isSubmitting}
        className="flex-1 disabled:opacity-40"
      >
        {phase === "error" ? "닫기" : "취소"}
      </Button>
      <Button
        size="lg"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="flex-[2] disabled:opacity-60"
      >
        {phase === "confirm" && `${total}개 등록`}
        {phase === "submitting" && (
          <>
            <LoaderCircle size={18} className="animate-spin" aria-hidden />
            등록 중…
          </>
        )}
        {phase === "error" && "다시 시도"}
      </Button>
    </div>
  );

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      dismissible={!isSubmitting}
      title={title}
      footer={footer}
    >
      <div className="flex flex-col gap-4">
        {phase === "confirm" && organizationField && (
          <div className="bg-light/60 rounded-xl px-4 py-3">
            {organizationField}
          </div>
        )}

        {phase === "submitting" && (
          <div className="flex flex-col gap-2" aria-live="polite">
            <div className="flex items-center justify-between text-sm">
              <span className="text-dark">사진 올리는 중</span>
              <span className="font-semibold">
                {doneCount} / {total}
              </span>
            </div>
            <div
              role="progressbar"
              aria-label="사진 올리는 중"
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={doneCount}
              className="bg-light h-1.5 overflow-hidden rounded-full"
            >
              <div
                className="bg-primary h-full rounded-full transition-[width] duration-300 ease-out"
                style={{ width: `${(doneCount / Math.max(total, 1)) * 100}%` }}
              />
            </div>
          </div>
        )}

        {phase === "error" && (
          <p className="text-dark text-sm break-keep">
            올라간 사진은 정리했어요. 입력한 정보는 그대로 두었으니 다시 시도해
            주세요.
          </p>
        )}

        {phase === "confirm" ? (
          <ul className="flex flex-col">
            {groupCoupons(coupons, imagePreviews).map(
              ({ key, coupon, thumbnail, count }, index) => (
                <li
                  key={key}
                  className={cn(
                    "flex items-center gap-3 py-2.5",
                    index > 0 && "border-light border-t",
                  )}
                >
                  <Thumbnail url={thumbnail} alt={`${coupon.name} 쿠폰`} />
                  <CouponSummary coupon={coupon} />
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-0.5 text-sm font-semibold",
                      count > 1
                        ? "bg-primary/10 text-primary"
                        : "bg-light text-ink/70",
                    )}
                  >
                    {count}개
                  </span>
                </li>
              ),
            )}
          </ul>
        ) : (
          // 등록 중·실패에는 사진마다 올라간 상태를 보여줌
          <ul className="flex flex-col">
            {coupons.map((coupon, index) => (
              <li
                key={imagePreviews[index] ?? index}
                className={cn(
                  "flex items-center gap-3 py-2.5",
                  index > 0 && "border-light border-t",
                )}
              >
                <Thumbnail
                  url={imagePreviews[index]}
                  alt={`${index + 1}번째 쿠폰`}
                />
                <CouponSummary coupon={coupon} />
                <UploadStatusIcon status={uploadStatuses[index] ?? "pending"} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </BottomSheet>
  );
}

export default RegisterConfirmSheet;
