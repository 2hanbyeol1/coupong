"use client";
import { Fragment } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import Image from "next/image";

import { COUPON_IMAGE_ASPECT_CLASS } from "@/entities/coupon/constants";
import {
  AMOUNT_CHECK_LABEL,
  FACE_VALUE_MAX_DIGITS,
  FACE_VALUE_QUICK_ADD_AMOUNTS,
  MAX_FACE_VALUE,
} from "@/entities/coupon/lib/amount";
import { COUPON_INFO } from "@/entities/coupon/lib/schema";
import { AddCouponFormValues } from "@/features/add-coupon/lib/schema";
import { encodeCouponKind } from "@/features/add-coupon/lib/util";
import { cn } from "@/shared/lib/util/cn";
import {
  AmountInput,
  Checkbox,
  Chip,
  DateInput,
  KeepSpace,
  SuggestionChips,
  ToggleChip,
} from "@/shared/ui";

import { focusNextField } from "./fieldNavigation";
import {
  FIELD_LABELS,
  getInfoFieldValue,
  INFO_FIELD_ORDER,
  InfoFieldName,
  setInfoFieldValue,
} from "./infoField";

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
  "ring-light focus:ring-primary w-full min-w-0 rounded-md px-4 text-ink py-2 ring-1 focus:ring-2";

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
    clearErrors,
    formState: { errors },
  } = useFormContext<AddCouponFormValues>();
  const coupons = useWatch({ control, name: "coupons" }) ?? [];

  const getSharedValue = (field: InfoFieldName) =>
    getInfoFieldValue(coupons[anchorIndex], field);

  const setCouponValue = (index: number, field: InfoFieldName, value: string) =>
    setInfoFieldValue(index, field, value, { setValue, clearErrors });

  const setSharedValue = (field: InfoFieldName, value: string) => {
    coupons.forEach((_, index) => setCouponValue(index, field, value));
  };

  const getSharedError = (field: InfoFieldName) =>
    errors.coupons?.[anchorIndex]?.[
      field === "couponKind" ? "face_value" : field
    ]?.message;

  /**
   * 쿠폰 이름 칸 바로 아래 '금액권이에요' 체크박스, 체크하면 바로 아래에 금액 칸
   * 모두 같게는 쿠폰 이름을 따름 (이름이 같으면 종류도 같으니)
   * 교환권 쿠폰 몫의 금액 칸은 목록 맨 아래에 보이지 않는 자리로 남겨,
   * 체크를 바꿔도 전체 높이가 그대로 (목록이 짧아지며 스크롤이 끌려 올라가지 않게)
   */
  const faceValueLabel = COUPON_INFO.face_value.label;
  const isKindShared = sharedFields.includes("couponKind");
  const isAmountAt = (index: number) => coupons[index]?.type === "amount";
  // 금액 칸 자리: 모두 같게면 칸 하나, 아니면 쿠폰마다
  const hiddenFaceValueSlots = (
    isKindShared ? [anchorIndex] : imagePreviews.map((_, index) => index)
  ).filter((index) => !isAmountAt(index));

  /** 금액권 체크를 바꿀 때: 입력해 둔 금액은 그대로 이어 씀 */
  const setAmountChecked = (index: number, isAmount: boolean) => {
    const value = encodeCouponKind({
      type: isAmount ? "amount" : "exchange",
      face_value: coupons[index]?.face_value ?? "",
    });
    if (isKindShared) setSharedValue("couponKind", value);
    else setCouponValue(index, "couponKind", value);
  };

  /** index번째 쿠폰의 금액 칸 (ghost면 자리만 남기는 빈 칸) */
  const renderFaceValueInput = (index: number, ghost = false) => (
    // 체크박스와의 간격은 gap 대신 pt로 (보이는 칸과 맨 아래 숨긴 칸의 높이가 같게)
    <div className="pt-1.5">
      <AmountInput
        label={
          isKindShared
            ? faceValueLabel
            : `${index + 1}번째 쿠폰 ${faceValueLabel}`
        }
        hideLabel
        enterKeyHint="next"
        maxDigits={FACE_VALUE_MAX_DIGITS}
        quickAddAmounts={FACE_VALUE_QUICK_ADD_AMOUNTS}
        maxAmount={MAX_FACE_VALUE}
        value={ghost ? "" : (coupons[index]?.face_value ?? "")}
        onChange={(digits) => {
          if (ghost) return;
          const value = encodeCouponKind({
            type: "amount",
            face_value: digits,
          });
          if (isKindShared) setSharedValue("couponKind", value);
          else setCouponValue(index, "couponKind", value);
        }}
        errorMessage={
          ghost ? undefined : errors.coupons?.[index]?.face_value?.message
        }
      />
    </div>
  );

  /** 쿠폰 이름 칸 바로 아래: 금액권 체크박스 + 체크했으면 금액 칸 */
  const renderKindInput = (index: number) => (
    <>
      <div className="mt-2 flex h-6 items-center">
        <Checkbox
          checked={isAmountAt(index)}
          onChange={(checked) => setAmountChecked(index, checked)}
          aria-label={
            isKindShared
              ? undefined
              : `${index + 1}번째 쿠폰 ${AMOUNT_CHECK_LABEL}`
          }
        >
          {AMOUNT_CHECK_LABEL}
        </Checkbox>
      </div>
      {isAmountAt(index) && renderFaceValueInput(index)}
    </>
  );

  const renderFaceValueSpace = () => {
    if (hiddenFaceValueSlots.length === 0) return null;
    return (
      // 목록 항목 사이 간격(gap-5)을 빼서, 숨긴 칸 높이만큼만 자리를 남김
      <KeepSpace visible={false} className="-mt-5">
        {hiddenFaceValueSlots.map((index) => (
          <Fragment key={imagePreviews[index]}>
            {renderFaceValueInput(index, true)}
          </Fragment>
        ))}
      </KeepSpace>
    );
  };

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
            <Chip color="overlay" className="absolute top-1 left-1">
              {index + 1}
            </Chip>
          </button>
        ))}
      </div>

      {INFO_FIELD_ORDER.map((field) => {
        const isShared = sharedFields.includes(field);
        const label = FIELD_LABELS[field];
        const sharedValue = getSharedValue(field);
        const sharedError = getSharedError(field);

        return (
          <Fragment key={field}>
            <div
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
                      <p className="text-error mt-1 text-start">
                        {sharedError}
                      </p>
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
                    {/* 쿠폰 이름 바로 아래 금액권 체크 (쿠폰 이름의 모두 같게를 따름) */}
                    {field === "name" && renderKindInput(anchorIndex)}
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
                            {/* 쿠폰 이름 바로 아래 금액권 체크 */}
                            {field === "name" && renderKindInput(index)}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Fragment>
        );
      })}
      {renderFaceValueSpace()}
    </div>
  );
}

export default BatchCouponInputs;
