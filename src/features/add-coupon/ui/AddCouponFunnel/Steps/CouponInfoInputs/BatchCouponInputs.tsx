"use client";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import Image from "next/image";

import { COUPON_IMAGE_ASPECT_CLASS } from "@/entities/coupon/constants";
import {
  AddCouponFormValues,
  CouponInfoFormValues,
} from "@/features/add-coupon/lib/schema";
import { COUPON_INFO_FIELD_ORDER } from "@/features/add-coupon/lib/util";
import { cn } from "@/shared/lib/util/cn";
import { DateInput, ToggleChip } from "@/shared/ui";

import { focusNextField } from "./fieldNavigation";
import SuggestionChips from "./SuggestionChips";

export type InfoFieldName = keyof CouponInfoFormValues;

export const FIELD_LABELS: Record<InfoFieldName, string> = {
  place: "사용처",
  name: "쿠폰 이름",
  expire_at: "유효 기간",
};

interface BatchCouponInputsProps {
  imagePreviews: string[];
  /** 사진을 누르면 그 쿠폰을 따로 입력 */
  onSelectCoupon: (index: number) => void;
  /** 모든 쿠폰에 같은 값을 쓰는 항목 */
  sharedFields: InfoFieldName[];
  onToggleSharedField: (field: InfoFieldName) => void;
  /** 같은 값을 쓰는 항목의 기준이 되는 쿠폰 (값이 모두 같으므로 화면엔 이 쿠폰 값을 보여줌) */
  anchorIndex: number;
  placeSuggestions: string[];
  nameSuggestions: string[];
  today: string;
}

const ROW_INPUT_CLASS =
  "ring-light focus:ring-primary w-full min-w-0 rounded-md px-4 py-2 text-black ring-1 focus:ring-2";

/**
 * 여러 쿠폰을 한 화면에서 입력
 * 항목마다 '모두 같게'를 켜면 칸 하나로 모든 쿠폰에 적용하고, 끄면 쿠폰마다 입력
 */
function BatchCouponInputs({
  imagePreviews,
  onSelectCoupon,
  sharedFields,
  onToggleSharedField,
  anchorIndex,
  placeSuggestions,
  nameSuggestions,
  today,
}: BatchCouponInputsProps) {
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext<AddCouponFormValues>();
  const coupons = useWatch({ control, name: "coupons" }) ?? [];

  const getSharedValue = (field: InfoFieldName) =>
    coupons[anchorIndex]?.[field] ?? "";

  const setSharedValue = (field: InfoFieldName, value: string) => {
    coupons.forEach((_, index) => {
      setValue(`coupons.${index}.${field}`, value, {
        shouldValidate: true,
        shouldDirty: true,
      });
    });
  };

  const getSharedError = (field: InfoFieldName) =>
    errors.coupons?.[anchorIndex]?.[field]?.message;

  // 키보드의 다음(Enter)은 폼을 제출하지 않고 다음 칸으로, 마지막 칸이면 키보드를 닫음
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" || !(event.target instanceof HTMLInputElement))
      return;
    event.preventDefault();
    if (!focusNextField(event.target, event.currentTarget)) {
      event.target.blur();
    }
  };

  return (
    <div className="flex flex-col gap-5" onKeyDown={handleKeyDown}>
      {/* 등록할 사진을 한눈에, 누르면 그 쿠폰만 따로 입력 */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4">
        {imagePreviews.map((url, index) => (
          <button
            key={url}
            type="button"
            onClick={() => onSelectCoupon(index)}
            aria-label={`${index + 1}번째 쿠폰 따로 입력`}
            className={cn(
              "border-light hover:border-primary/40 relative h-36 shrink-0 cursor-pointer overflow-hidden rounded-md border-2 transition-[border-color,transform] duration-200 active:scale-95",
              COUPON_IMAGE_ASPECT_CLASS,
            )}
          >
            <Image src={url} alt="" fill className="object-contain" />
            <span className="absolute top-1 left-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black/50 px-1 text-xs text-white">
              {index + 1}
            </span>
          </button>
        ))}
      </div>

      {COUPON_INFO_FIELD_ORDER.map((field) => {
        const isShared = sharedFields.includes(field);
        const label = FIELD_LABELS[field];
        const sharedValue = getSharedValue(field);
        const sharedError = getSharedError(field);

        return (
          <div
            key={field}
            role="group"
            aria-label={label}
            className="flex flex-col gap-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-dark text-sm">
                {label}
                {/* 유효 기간만 필수 */}
                {field === "expire_at" && (
                  <span className="text-error"> *</span>
                )}
              </span>
              <ToggleChip
                pressed={isShared}
                onChange={() => onToggleSharedField(field)}
              >
                모두 같게
              </ToggleChip>
            </div>

            {isShared ? (
              // 칸 하나로 모든 쿠폰에 적용
              field === "expire_at" ? (
                <DateInput
                  label={label}
                  hideLabel
                  value={sharedValue}
                  onChange={(value) => setSharedValue(field, value)}
                  min={today}
                  errorMessage={sharedError}
                />
              ) : (
                <div>
                  <input
                    aria-label={label}
                    autoComplete="off"
                    enterKeyHint="next"
                    value={sharedValue}
                    onChange={(event) =>
                      setSharedValue(field, event.target.value)
                    }
                    className={ROW_INPUT_CLASS}
                  />
                  {sharedError && (
                    <p className="text-error mt-1 text-start">{sharedError}</p>
                  )}
                  {field === "place" && (
                    <SuggestionChips
                      show={sharedValue.trim() === ""}
                      items={placeSuggestions}
                      onSelect={(item) => setSharedValue("place", item)}
                    />
                  )}
                  {field === "name" && (
                    <SuggestionChips
                      show={
                        sharedValue.trim() === "" &&
                        getSharedValue("place").trim() !== ""
                      }
                      items={nameSuggestions}
                      onSelect={(item) => setSharedValue("name", item)}
                    />
                  )}
                </div>
              )
            ) : (
              // 쿠폰마다 입력
              imagePreviews.map((url, index) => {
                const rowLabel = `${index + 1}번째 쿠폰 ${label}`;
                const error = errors.coupons?.[index]?.[field]?.message;
                return (
                  <div key={url} className="flex items-start gap-2.5">
                    <span className="bg-light mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      {field === "expire_at" ? (
                        <Controller
                          control={control}
                          name={`coupons.${index}.expire_at`}
                          render={({ field: controllerField }) => (
                            <DateInput
                              ref={controllerField.ref}
                              name={controllerField.name}
                              label={rowLabel}
                              hideLabel
                              value={controllerField.value ?? ""}
                              onChange={controllerField.onChange}
                              onBlur={controllerField.onBlur}
                              min={today}
                              errorMessage={error}
                            />
                          )}
                        />
                      ) : (
                        <>
                          <input
                            aria-label={rowLabel}
                            autoComplete="off"
                            enterKeyHint="next"
                            className={ROW_INPUT_CLASS}
                            {...register(`coupons.${index}.${field}`)}
                          />
                          {error && (
                            <p className="text-error mt-1 text-start">
                              {error}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        );
      })}
    </div>
  );
}

export default BatchCouponInputs;
