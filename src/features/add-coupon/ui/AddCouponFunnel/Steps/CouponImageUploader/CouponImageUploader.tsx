"use client";
import { ReactNode, useId, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ImagePlus, Plus, X } from "lucide-react";
import Image from "next/image";

import { COUPON_IMAGE_ASPECT_CLASS } from "@/entities/coupon/constants";
import { useOrganizationStore } from "@/entities/organization/model/store";
import {
  MAX_COUPON_IMAGE_COUNT,
  MAX_COUPON_IMAGE_SIZE_MB,
} from "@/features/add-coupon/lib/constants";
import {
  AddCouponFormValues,
  couponInfoSchema,
} from "@/features/add-coupon/lib/schema";
import useModal from "@/shared/lib/hook/useModal";
import useToast from "@/shared/lib/hook/useToast";
import { cn } from "@/shared/lib/util/cn";
import { Button } from "@/shared/ui";

interface CouponImageUploaderProps {
  onNext: () => void;
  imagePreviews: string[];
  /** 새로 고른 사진 (뒤에 이어 붙음) */
  onImagesAdd: (files: File[]) => void;
  onImageRemove: (index: number) => void;
  /** false면 정보를 입력한 사진을 지울 때 확인 모달 없이 바로 지움 */
  confirmBeforeRemove: boolean;
  /** 확인 모달에서 '다시 묻지 않기'를 고르고 지웠을 때 */
  onDisableRemoveConfirm: () => void;
  /** 등록할 그룹을 고르는 영역 */
  organizationField?: ReactNode;
}

const MAX_COUPON_IMAGE_SIZE_BYTES = MAX_COUPON_IMAGE_SIZE_MB * 1024 * 1024;

// 지운 사진만 줄어들며 사라지고, 나머지는 자리만 당겨짐
const tileMotion = {
  layout: true,
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: { duration: 0.2, ease: "easeOut" },
} as const;

function fileListFromFiles(files: File[]): FileList {
  const dt = new DataTransfer();
  files.forEach((file) => dt.items.add(file));
  return dt.files;
}

function CouponImageUploader({
  onNext,
  imagePreviews,
  onImagesAdd,
  onImageRemove,
  confirmBeforeRemove,
  onDisableRemoveConfirm,
  organizationField,
}: CouponImageUploaderProps) {
  const { control, setValue, getValues, clearErrors } =
    useFormContext<AddCouponFormValues>();
  const coupons = useWatch({ control, name: "coupons" });
  const { addToast } = useToast();
  const { showModal, hideModal } = useModal();
  const { selectedOrganizationId, isHydrated } = useOrganizationStore();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const imageCount = imagePreviews.length;
  const hasImages = imageCount > 0;
  const canAddMore = imageCount < MAX_COUPON_IMAGE_COUNT;
  // 정보 입력 단계에서 돌아왔을 때, 정보를 다 입력한 사진 표시
  const isCouponComplete = (index: number) =>
    couponInfoSchema.safeParse(coupons?.[index]).success;

  const setImageFiles = (files: File[]) => {
    setValue("imageFile", fileListFromFiles(files), {
      shouldValidate: true,
      shouldDirty: true,
    });
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

    if (accepted.length === 0) return;
    setImageFiles([...current, ...accepted]);
    onImagesAdd(accepted);
  };

  const removeImage = (index: number) => {
    // 입력해 둔 쿠폰 정보가 다른 사진에 붙지 않도록 같은 위치의 정보도 함께 삭제
    const currentCoupons = getValues("coupons") ?? [];
    if (index < currentCoupons.length) {
      setValue(
        "coupons",
        currentCoupons.filter((_, i) => i !== index),
        { shouldDirty: true },
      );
      clearErrors("coupons");
    }
    setImageFiles(getCurrentFiles().filter((_, i) => i !== index));
    onImageRemove(index);
  };

  const handleRemove = (index: number) => {
    const coupon = getValues(`coupons.${index}`);
    const hasEnteredInfo = !!(
      coupon?.place ||
      coupon?.name ||
      coupon?.expire_at
    );
    // 입력한 정보가 없으면 잃을 것이 없으므로 바로 삭제
    if (!hasEnteredInfo || !confirmBeforeRemove) {
      removeImage(index);
      return;
    }

    showModal({
      title: "사진을 지울까요?",
      content: (
        <p className="break-keep">이 쿠폰에 입력한 정보도 함께 지워져요.</p>
      ),
      checkboxLabel: "이번 등록에서는 다시 묻지 않기",
      confirmButtonText: "지우기",
      onConfirm: ({ checked: dontAskAgain }) => {
        if (dontAskAgain) onDisableRemoveConfirm();
        removeImage(index);
        hideModal();
      },
    });
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
              <AnimatePresence initial={false} mode="popLayout">
                {imagePreviews.map((url, index) => (
                  <motion.div
                    key={url}
                    {...tileMotion}
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
                      aria-label={`쿠폰 이미지 ${index + 1} 제거`}
                      onClick={() => handleRemove(index)}
                      className="absolute top-1 right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white"
                    >
                      <X size={14} />
                    </button>
                    {isCouponComplete(index) && (
                      <span className="absolute inset-x-1 bottom-1 flex h-6 items-center justify-center gap-0.5 rounded bg-black/80 text-xs font-semibold text-white">
                        <Check size={12} strokeWidth={3} aria-hidden />
                        입력 완료
                      </span>
                    )}
                  </motion.div>
                ))}
                {canAddMore && (
                  <motion.label
                    key="add-image"
                    {...tileMotion}
                    htmlFor={inputId}
                    aria-label="사진 추가"
                    className={cn(
                      "border-light bg-light flex cursor-pointer items-center justify-center rounded-md border-2",
                      COUPON_IMAGE_ASPECT_CLASS,
                    )}
                  >
                    <Plus className="stroke-dark" size={24} />
                  </motion.label>
                )}
              </AnimatePresence>
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

      <div className="flex shrink-0 flex-col gap-3 pt-4">
        <Button
          onClick={onNext}
          disabled={isNextDisabled}
          color="primary"
          size="lg"
          full
        >
          {hasImages ? `${imageCount}개 쿠폰 정보 입력하기` : "다음"}
        </Button>
      </div>
    </div>
  );
}

export default CouponImageUploader;
