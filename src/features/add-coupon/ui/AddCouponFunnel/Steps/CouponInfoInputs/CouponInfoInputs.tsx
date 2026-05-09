"use client";
import { useEffect, useId, useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import Image from "next/image";

import { COUPON_INFO } from "@/entities/coupon/lib/schema";
import {
  AddCouponFormValues,
  CouponInfoFormValues,
} from "@/features/add-coupon/lib/schema";
import useToast from "@/shared/lib/hook/useToast";
import { Button, Checkbox, TextInput } from "@/shared/ui";

interface CouponInfoInputsProps {
  imagePreviews: string[];
  currentIndex: number;
  onCurrentIndexChange: (index: number) => void;
  isSubmitting: boolean;
  submitLabel: string;
}

const INPUT_CONFIG = [
  { ...COUPON_INFO.place },
  { ...COUPON_INFO.name },
  { ...COUPON_INFO.expire_at },
] as const;

type InfoFieldName = keyof CouponInfoFormValues;

const TEXT_AUTOCOMPLETE_FIELDS: InfoFieldName[] = ["place", "name"];

function CouponInfoInputs({
  imagePreviews,
  currentIndex,
  onCurrentIndexChange,
  isSubmitting,
  submitLabel,
}: CouponInfoInputsProps) {
  const {
    register,
    setValue,
    getValues,
    trigger,
    control,
    formState: { errors },
  } = useFormContext<AddCouponFormValues>();

  const { addToast } = useToast();
  const reactId = useId();

  const [applyAll, setApplyAll] = useState(false);

  // 이미지 개수에 맞춰 coupons 배열 길이 동기화
  useEffect(() => {
    const current = getValues("coupons") ?? [];
    if (current.length === imagePreviews.length) return;

    const next: CouponInfoFormValues[] = imagePreviews.map(
      (_, index) => current[index] ?? { name: "", place: "", expire_at: "" },
    );
    setValue("coupons", next, { shouldValidate: false, shouldDirty: true });

    if (currentIndex >= imagePreviews.length) {
      onCurrentIndexChange(Math.max(0, imagePreviews.length - 1));
    }
  }, [imagePreviews, getValues, setValue, currentIndex, onCurrentIndexChange]);

  // 이전에 입력했던 값들을 자동완성 후보로 수집
  const couponsWatch = useWatch({ control, name: "coupons" });
  const autocompleteOptions = useMemo(() => {
    const coupons = couponsWatch ?? [];
    const collect = (field: InfoFieldName) => {
      const set = new Set<string>();
      coupons.forEach((coupon, idx) => {
        if (idx === currentIndex) return; // 현재 입력 중인 항목 제외
        const value = coupon?.[field];
        if (typeof value === "string" && value.trim().length > 0) {
          set.add(value);
        }
      });
      return [...set];
    };
    return {
      place: collect("place"),
      name: collect("name"),
    };
  }, [couponsWatch, currentIndex]);

  // applyAll 체크 시 현재 항목의 값을 모든 항목에 동기화
  useEffect(() => {
    if (!applyAll) return;
    const currentValues = getValues(`coupons.${currentIndex}`);
    if (!currentValues) return;

    const coupons = getValues("coupons") ?? [];
    coupons.forEach((_, idx) => {
      if (idx === currentIndex) return;
      setValue(
        `coupons.${idx}`,
        { ...currentValues },
        { shouldValidate: true },
      );
    });
  }, [applyAll, currentIndex, getValues, setValue]);

  const handleFieldBlur = (field: InfoFieldName) => {
    if (!applyAll) return;
    const value = getValues(`coupons.${currentIndex}.${field}`);
    const coupons = getValues("coupons") ?? [];
    coupons.forEach((_, idx) => {
      if (idx === currentIndex) return;
      setValue(`coupons.${idx}.${field}`, value, { shouldValidate: true });
    });
  };

  const handleFirst = (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    onCurrentIndexChange(0);
  };

  const handlePrev = (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    onCurrentIndexChange(Math.max(0, currentIndex - 1));
  };

  const handleLast = (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    onCurrentIndexChange(Math.max(0, imagePreviews.length - 1));
  };

  const handleNext = async (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    const valid = await trigger(`coupons.${currentIndex}`);
    if (!valid) {
      const fieldErrors = errors.coupons?.[currentIndex];
      const firstError = INPUT_CONFIG.map(
        ({ name }) => fieldErrors?.[name as InfoFieldName]?.message,
      ).find(Boolean);
      if (firstError) {
        addToast({ message: firstError as string, type: "error" });
      }
      return;
    }
    onCurrentIndexChange(Math.min(imagePreviews.length - 1, currentIndex + 1));
  };

  const isLast = currentIndex === imagePreviews.length - 1;
  const couponImage = imagePreviews[currentIndex];

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex h-full flex-col gap-3">
        {imagePreviews.length > 1 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleFirst}
                disabled={currentIndex === 0}
                aria-label="첫 쿠폰"
                className="flex h-6 w-6 items-center justify-center rounded-full disabled:opacity-30"
              >
                <ChevronsLeft size={20} />
              </button>
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                aria-label="이전 쿠폰"
                className="flex h-6 w-6 items-center justify-center rounded-full disabled:opacity-30"
              >
                <ChevronLeft size={20} />
              </button>
            </div>
            <span className="text-dark text-sm">
              {currentIndex + 1} / {imagePreviews.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleNext}
                disabled={isLast}
                aria-label="다음 쿠폰"
                className="flex h-6 w-6 items-center justify-center rounded-full disabled:opacity-30"
              >
                <ChevronRight size={20} />
              </button>
              <button
                type="button"
                onClick={handleLast}
                disabled={isLast}
                aria-label="마지막 쿠폰"
                className="flex h-6 w-6 items-center justify-center rounded-full disabled:opacity-30"
              >
                <ChevronsRight size={20} />
              </button>
            </div>
          </div>
        )}
        <div className="flex h-full flex-col">
          <h1 className="mb-4 text-2xl leading-snug font-semibold">
            쿠폰에 대한 설명을
            <br />
            입력해주세요
          </h1>
          <div className="flex h-full flex-col">
            {couponImage && (
              <div className="relative mb-4 h-full w-full flex-1">
                <Image
                  src={couponImage}
                  alt={`쿠폰 이미지 ${currentIndex + 1}`}
                  fill
                  className="object-contain object-left"
                />
              </div>
            )}
            <div className="flex flex-col gap-3">
              {INPUT_CONFIG.map(({ name, type, placeholder, ...props }) => {
                const fieldName = name as InfoFieldName;
                const useAutocomplete =
                  TEXT_AUTOCOMPLETE_FIELDS.includes(fieldName);
                const listId = useAutocomplete
                  ? `${reactId}-${fieldName}-options`
                  : undefined;
                const options = useAutocomplete
                  ? autocompleteOptions[fieldName as "place" | "name"]
                  : [];
                return (
                  <div key={`${fieldName}-${currentIndex}`}>
                    <TextInput
                      type={type}
                      placeholder={placeholder}
                      list={listId}
                      {...props}
                      {...register(`coupons.${currentIndex}.${fieldName}`, {
                        onBlur: () => handleFieldBlur(fieldName),
                      })}
                    />
                    {useAutocomplete && options.length > 0 && (
                      <datalist id={listId}>
                        {options.map((value) => (
                          <option key={value} value={value} />
                        ))}
                      </datalist>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {imagePreviews.length > 1 && (
          <Checkbox checked={applyAll} onChange={setApplyAll}>
            모든 쿠폰을 같은 정보로 등록할게요
          </Checkbox>
        )}

        {isLast ? (
          <Button type="submit" size="lg" full disabled={isSubmitting}>
            {isSubmitting ? "등록 중..." : submitLabel}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleNext}
            color="light"
            size="lg"
            full
          >
            다음으로
          </Button>
        )}
      </div>
    </div>
  );
}

export default CouponInfoInputs;
