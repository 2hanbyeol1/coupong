"use client";
import { ReactNode, useId, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { ImagePlus, Plus, X } from "lucide-react";
import Image from "next/image";

import { COUPON_IMAGE_ASPECT_CLASS } from "@/entities/coupon/constants";
import { useOrganizationStore } from "@/entities/organization/model/store";
import {
  MAX_COUPON_IMAGE_COUNT,
  MAX_COUPON_IMAGE_SIZE_MB,
} from "@/features/add-coupon/lib/constants";
import { AddCouponFormValues } from "@/features/add-coupon/lib/schema";
import useToast from "@/shared/lib/hook/useToast";
import { cn } from "@/shared/lib/util/cn";
import { Button } from "@/shared/ui";

interface CouponImageUploaderProps {
  onNext: () => void;
  imagePreviews: string[];
  onImagesChange: (files: File[]) => void;
  /** 등록할 그룹을 고르는 영역 */
  organizationField?: ReactNode;
}

const MAX_COUPON_IMAGE_SIZE_BYTES = MAX_COUPON_IMAGE_SIZE_MB * 1024 * 1024;

function fileListFromFiles(files: File[]): FileList {
  const dt = new DataTransfer();
  files.forEach((file) => dt.items.add(file));
  return dt.files;
}

function CouponImageUploader({
  onNext,
  imagePreviews,
  onImagesChange,
  organizationField,
}: CouponImageUploaderProps) {
  const { setValue, getValues } = useFormContext<AddCouponFormValues>();
  const { addToast } = useToast();
  const { selectedOrganizationId, isHydrated } = useOrganizationStore();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const hasImages = imagePreviews.length > 0;
  const canAddMore = imagePreviews.length < MAX_COUPON_IMAGE_COUNT;

  const syncFiles = (files: File[]) => {
    const fileList = fileListFromFiles(files);
    setValue("imageFile", fileList, {
      shouldValidate: true,
      shouldDirty: true,
    });
    onImagesChange(files);
  };

  const getCurrentFiles = (): File[] => {
    const current = getValues("imageFile") as FileList | undefined;
    return current ? Array.from(current) : [];
  };

  const handleFilesPicked = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    // 같은 파일을 다시 선택할 수 있도록 input 값 초기화
    if (inputRef.current) inputRef.current.value = "";
    if (picked.length === 0) return;

    const sizeAllowed = picked.filter(
      (file) => file.size <= MAX_COUPON_IMAGE_SIZE_BYTES,
    );
    const current = getCurrentFiles();
    const remaining = Math.max(0, MAX_COUPON_IMAGE_COUNT - current.length);
    const accepted = sizeAllowed.slice(0, remaining);

    const oversizedCount = picked.length - sizeAllowed.length;
    if (oversizedCount > 0) {
      addToast({
        message: `${MAX_COUPON_IMAGE_SIZE_MB}MB가 넘는 사진 ${oversizedCount}장은 제외했어요`,
      });
    }
    if (accepted.length < sizeAllowed.length) {
      addToast({
        message: `사진은 최대 ${MAX_COUPON_IMAGE_COUNT}장까지 올릴 수 있어요`,
      });
    }

    if (accepted.length > 0) syncFiles([...current, ...accepted]);
  };

  const handleRemove = (index: number) => {
    syncFiles(getCurrentFiles().filter((_, i) => i !== index));
  };

  const isNextDisabled = !isHydrated || !selectedOrganizationId || !hasImages;

  return (
    <div className="flex h-full w-full flex-col p-4">
      <div className="flex min-h-0 flex-1 flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl leading-snug font-semibold">
            기프티콘을
            <br />
            업로드해주세요
          </h1>
          {organizationField}
        </div>

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFilesPicked}
        />

        {hasImages ? (
          <div className="min-h-0 flex-1 overflow-y-auto">
            {/* 모바일에선 3열, 화면이 넓어지면 칸 크기를 유지한 채 열 수가 늘어남 */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] gap-2">
              {imagePreviews.map((url, index) => (
                <div
                  key={url}
                  className={cn(
                    "border-light relative overflow-hidden rounded-md border-2",
                    COUPON_IMAGE_ASPECT_CLASS,
                  )}
                >
                  <Image
                    src={url}
                    alt={`쿠폰 이미지 ${index + 1}`}
                    fill
                    className="object-contain"
                  />
                  <button
                    type="button"
                    aria-label="이미지 제거"
                    onClick={() => handleRemove(index)}
                    className="absolute top-1 right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {canAddMore && (
                <label
                  htmlFor={inputId}
                  aria-label="사진 추가"
                  className={cn(
                    "border-light bg-light flex cursor-pointer items-center justify-center rounded-md border-2",
                    COUPON_IMAGE_ASPECT_CLASS,
                  )}
                >
                  <Plus className="stroke-dark" size={24} />
                </label>
              )}
            </div>
          </div>
        ) : (
          <label
            htmlFor={inputId}
            // 넓은 화면에서는 높이에 맞춰 너비를 쿠폰 비율(9:16)로 제한
            className="border-light bg-light tablet:aspect-[9/16] tablet:max-w-full tablet:self-start flex min-h-0 flex-1 cursor-pointer flex-col items-center justify-center gap-2.5 rounded-md border-2 p-6 text-center"
          >
            <span className="bg-dark/10 flex h-16 w-16 items-center justify-center rounded-full">
              <ImagePlus className="stroke-dark" size={30} />
            </span>
            <span className="text-lg font-semibold">사진 선택하기</span>
            <span className="text-sm leading-normal text-black/70">
              기프티콘 캡처를 여러 장
              <br />한 번에 고를 수 있어요
            </span>
            <span className="text-dark text-xs">
              최대 {MAX_COUPON_IMAGE_COUNT}장 · 장당 {MAX_COUPON_IMAGE_SIZE_MB}
              MB
            </span>
          </label>
        )}
      </div>

      <div className="flex shrink-0 flex-col pt-4">
        <Button
          onClick={onNext}
          disabled={isNextDisabled}
          color="primary"
          size="lg"
          full
        >
          다음
        </Button>
      </div>
    </div>
  );
}

export default CouponImageUploader;
