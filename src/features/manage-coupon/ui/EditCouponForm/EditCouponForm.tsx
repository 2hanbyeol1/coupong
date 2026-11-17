"use client";
import { useEffect, useId, useMemo, useState } from "react";
import {
  Controller,
  SubmitErrorHandler,
  useForm,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";

import {
  searchCouponSuggestionsOption,
  updateCouponOption,
} from "@/entities/coupon/api/query";
import { CouponType } from "@/entities/coupon/api/type";
import {
  AMOUNT_CHECK_LABEL,
  FACE_VALUE_MAX_DIGITS,
  FACE_VALUE_QUICK_ADD_AMOUNTS,
  MAX_FACE_VALUE,
  MIN_FACE_VALUE,
} from "@/entities/coupon/lib/amount";
import {
  COUPON_INFO,
  couponInfoObjectSchema,
  CouponInfoValues,
  refineFaceValue,
  toFaceValue,
} from "@/entities/coupon/lib/schema";
import useCouponAutocomplete, {
  CouponAutocompleteField,
} from "@/entities/coupon/model/useCouponAutocomplete";
import useModal from "@/shared/lib/hook/useModal";
import useToast from "@/shared/lib/hook/useToast";
import { getTodayDateInputValue } from "@/shared/lib/util/date";
import { formatWon } from "@/shared/lib/util/money";
import {
  AmountInput,
  AutocompleteList,
  Checkbox,
  DateInput,
  KeepSpace,
  SuggestionChips,
  TextInput,
} from "@/shared/ui";

const TEXT_INPUT_CONFIG = [
  { ...COUPON_INFO.place },
  { ...COUPON_INFO.name },
] as const;

const MAX_PLACE_SUGGESTIONS = 5;
const MAX_NAME_SUGGESTIONS = 10;

/** 종류를 바꿀 수 없는 이유 (바꿀 수 있으면 null) */
/** 사용 내역이 있는 금액권, 사용한 교환권 (종류는 관리자만 바꿀 수 있음, DB에서도 막음) */
const getHasUsage = (coupon: CouponType) =>
  coupon.type === "amount" ? coupon.used_amount > 0 : !!coupon.used_by;

/** 사용한 쿠폰의 종류를 바꾸면 사용 상태가 어떻게 옮겨 가는지 (DB의 sync_amount_coupon_used_by와 같게) */
const getKindChangeNotice = (coupon: CouponType) =>
  coupon.type === "exchange"
    ? "이미 사용한 쿠폰이라 다 쓴 금액권이 돼요"
    : coupon.used_amount >= (coupon.face_value ?? 0)
      ? "사용 내역은 지워지고 사용한 교환권이 돼요"
      : "사용 내역은 지워지고 아직 안 쓴 교환권이 돼요";

export interface EditCouponFormProps {
  coupon: CouponType;
  formId: string;
  /** 그룹 관리자면 사용한 쿠폰도 종류를 바꿀 수 있음 */
  isAdmin?: boolean;
}

function EditCouponForm({
  coupon,
  formId,
  isAdmin = false,
}: EditCouponFormProps) {
  const queryClient = useQueryClient();
  const { hideModal, updateModal } = useModal();
  const { addToast } = useToast();
  const reactId = useId();

  // 금액권은 이미 쓴 금액보다 적게 바꿀 수 없음
  const schema = useMemo(
    () =>
      couponInfoObjectSchema.superRefine(
        refineFaceValue({
          minFaceValue: Math.max(MIN_FACE_VALUE, coupon.used_amount),
        }),
      ),
    [coupon.used_amount],
  );
  const hasUsage = getHasUsage(coupon);
  const isKindLocked = hasUsage && !isAdmin;

  const { register, control, handleSubmit, setValue, clearErrors } =
    useForm<CouponInfoValues>({
      mode: "onChange",
      resolver: zodResolver(schema),
      defaultValues: {
        place: coupon.place,
        name: coupon.name,
        expire_at: coupon.expire_at.slice(0, 10),
        type: coupon.type,
        face_value: coupon.face_value?.toString() ?? "",
      },
    });

  const [currentPlace = "", currentName = "", currentType] = useWatch({
    control,
    name: ["place", "name", "type"],
  });

  const handleAmountCheck = (isAmount: boolean) => {
    setValue("type", isAmount ? "amount" : "exchange", { shouldDirty: true });
    // 교환권은 금액을 보지 않으므로 남아 있던 금액 오류를 지움
    if (!isAmount) clearErrors("face_value");
  };

  // 자동완성 목록을 띄울 입력칸
  // 포커스만 했을 때는 검색하지 않고, 글자를 입력해야 열림 (포커스가 빠지면 닫힘)
  const [autocompleteField, setAutocompleteField] =
    useState<CouponAutocompleteField | null>(null);
  // 사용처가 입력되어 있고 사용처를 고치는 중이 아니면 입력을 마친 것으로 봄
  const isPlaceEntered =
    currentPlace.trim() !== "" && autocompleteField !== "place";

  // 사용처 추천 태그: 그룹에서 많이 쓴 순
  const { data: placeSuggestions = [] } = useQuery(
    searchCouponSuggestionsOption({
      organizationId: coupon.organization_id,
      field: "place",
      limit: MAX_PLACE_SUGGESTIONS,
    }),
  );

  // 쿠폰 이름 추천 태그: 그 사용처로 등록했던 쿠폰 이름만
  const { data: nameSuggestions = [] } = useQuery(
    searchCouponSuggestionsOption(
      {
        organizationId: coupon.organization_id,
        field: "name",
        place: currentPlace.trim(),
        placeOnly: true,
        limit: MAX_NAME_SUGGESTIONS,
      },
      { enabled: isPlaceEntered },
    ),
  );

  const autocompleteQuery = autocompleteField
    ? (autocompleteField === "place" ? currentPlace : currentName).trim()
    : "";
  const {
    items: autocompleteResult,
    field: autocompleteResultField,
    isLoading: isAutocompleteLoading,
  } = useCouponAutocomplete({
    organizationId: coupon.organization_id,
    field: autocompleteField,
    query: autocompleteQuery,
    // 쿠폰 이름은 지금 입력한 사용처에서 쓰였던 이름을 먼저
    place: currentPlace,
  });

  const selectValue = (field: CouponAutocompleteField, value: string) => {
    setValue(field, value, { shouldValidate: true, shouldDirty: true });
  };

  const { mutate: updateCoupon, isPending } = useMutation({
    ...updateCouponOption(queryClient, {
      onSuccess: () => {
        addToast({ message: "쿠폰이 수정되었어요" });
        hideModal();
      },
      onError: (error) => {
        addToast({ message: error.message });
      },
    }),
  });

  useEffect(() => {
    updateModal({ confirmButtonDisabled: isPending });
  }, [isPending, updateModal]);

  const onSubmit = (data: CouponInfoValues) => {
    updateCoupon({
      couponId: coupon.id,
      changes: {
        place: data.place,
        name: data.name,
        expire_at: data.expire_at,
        type: data.type,
        face_value: toFaceValue(data),
      },
    });
  };

  const onInvalid: SubmitErrorHandler<CouponInfoValues> = (errors) => {
    const first =
      errors.place?.message ??
      errors.name?.message ??
      errors.expire_at?.message ??
      errors.face_value?.message;
    if (first) addToast({ message: String(first) });
  };

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit, onInvalid)}>
      <div className="text-ink flex flex-col gap-3 text-left">
        {TEXT_INPUT_CONFIG.map(({ name, ...props }) => {
          const fieldName = name as CouponAutocompleteField;
          // 입력칸이 비어 있으면 목록을 띄우지 않음
          const isAutocompleteOpen =
            autocompleteField === fieldName && autocompleteQuery !== "";
          // 다른 칸에서 검색한 결과는 보여주지 않음
          const autocompleteItems =
            isAutocompleteOpen && autocompleteResultField === fieldName
              ? autocompleteResult
              : [];
          const showAutocomplete =
            isAutocompleteOpen &&
            (autocompleteItems.length > 0 || isAutocompleteLoading);
          const listId = `${reactId}-${fieldName}-autocomplete`;
          return (
            <div key={fieldName}>
              <div className="relative">
                <TextInput
                  autoComplete="off"
                  aria-controls={showAutocomplete ? listId : undefined}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") setAutocompleteField(null);
                  }}
                  {...props}
                  {...register(fieldName, {
                    onChange: () => setAutocompleteField(fieldName),
                    onBlur: () => setAutocompleteField(null),
                  })}
                />
                {showAutocomplete && (
                  <AutocompleteList
                    id={listId}
                    items={autocompleteItems}
                    query={autocompleteQuery}
                    isLoading={isAutocompleteLoading}
                    onSelect={(value) => {
                      selectValue(fieldName, value);
                      setAutocompleteField(null);
                    }}
                  />
                )}
              </div>
              {/* 사용처를 지웠을 때 많이 쓴 사용처 추천 */}
              {fieldName === "place" && (
                <SuggestionChips
                  show={currentPlace.trim() === ""}
                  items={placeSuggestions}
                  onSelect={(value) => selectValue("place", value)}
                />
              )}
              {/* 쿠폰 이름을 지웠을 때 그 사용처로 등록했던 쿠폰 이름 추천 */}
              {fieldName === "name" && (
                <SuggestionChips
                  show={isPlaceEntered && currentName.trim() === ""}
                  items={nameSuggestions}
                  onSelect={(value) => selectValue("name", value)}
                />
              )}
            </div>
          );
        })}
        {/* 유효 기간 바로 위: 금액권이면 체크하고 바로 아래에 금액 입력
            종류를 바꿀 수 없는 쿠폰은 체크박스를 보여주지 않음 (금액권이면 금액 칸만) */}
        {!isKindLocked && (
          <Checkbox
            checked={currentType === "amount"}
            onChange={handleAmountCheck}
            className="self-start"
          >
            {AMOUNT_CHECK_LABEL}
          </Checkbox>
        )}
        {currentType === "amount" && (
          <div className="flex flex-col gap-1">
            <Controller
              control={control}
              name="face_value"
              render={({ field, fieldState }) => (
                <AmountInput
                  ref={field.ref}
                  name={field.name}
                  label={COUPON_INFO.face_value.label}
                  required
                  maxDigits={FACE_VALUE_MAX_DIGITS}
                  quickAddAmounts={FACE_VALUE_QUICK_ADD_AMOUNTS}
                  maxAmount={MAX_FACE_VALUE}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            {coupon.used_amount > 0 && (
              <p className="text-dark text-sm">
                지금까지 {formatWon(coupon.used_amount)}을 썼어요
              </p>
            )}
          </div>
        )}
        <Controller
          control={control}
          name="expire_at"
          render={({ field }) => (
            <DateInput
              ref={field.ref}
              name={field.name}
              label={COUPON_INFO.expire_at.label}
              required={COUPON_INFO.expire_at.required}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              min={getTodayDateInputValue()}
            />
          )}
        />
        {/* 관리자가 사용한 쿠폰의 종류를 바꾸면 사용 상태가 어떻게 되는지 맨 아래 상자로 미리 알려줌 */}
        {hasUsage && currentType !== coupon.type && (
          <p className="bg-light/60 text-dark mt-1 flex items-start gap-2 rounded-xl px-4 py-3 text-sm break-keep">
            <Info size={16} className="mt-0.5 shrink-0" aria-hidden />
            {getKindChangeNotice(coupon)}
          </p>
        )}
        {/* 교환권이면 금액 칸만큼 맨 아래에 보이지 않는 자리를 남겨, 종류를 바꿔도 창 높이가 그대로 */}
        {/* 종류를 바꿀 수 없으면 높이가 바뀔 일이 없어 자리도 남기지 않음 */}
        {!isKindLocked && currentType !== "amount" && (
          <KeepSpace visible={false}>
            <AmountInput
              label={COUPON_INFO.face_value.label}
              required
              quickAddAmounts={FACE_VALUE_QUICK_ADD_AMOUNTS}
              value=""
              onChange={() => {}}
            />
          </KeepSpace>
        )}
      </div>
    </form>
  );
}

export default EditCouponForm;
