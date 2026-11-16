"use client";
import { useEffect, useId, useState } from "react";
import {
  Controller,
  SubmitErrorHandler,
  useForm,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  searchCouponSuggestionsOption,
  updateCouponOption,
} from "@/entities/coupon/api/query";
import { CouponType } from "@/entities/coupon/api/type";
import {
  COUPON_INFO,
  couponInfoObjectSchema,
  CouponInfoValues,
} from "@/entities/coupon/lib/schema";
import useCouponAutocomplete, {
  CouponAutocompleteField,
} from "@/entities/coupon/model/useCouponAutocomplete";
import useModal from "@/shared/lib/hook/useModal";
import useToast from "@/shared/lib/hook/useToast";
import { getTodayDateInputValue } from "@/shared/lib/util/date";
import {
  AutocompleteList,
  DateInput,
  SuggestionChips,
  TextInput,
} from "@/shared/ui";

const TEXT_INPUT_CONFIG = [
  { ...COUPON_INFO.place },
  { ...COUPON_INFO.name },
] as const;

const MAX_PLACE_SUGGESTIONS = 5;
const MAX_NAME_SUGGESTIONS = 10;

export interface EditCouponFormProps {
  coupon: CouponType;
  formId: string;
}

function EditCouponForm({ coupon, formId }: EditCouponFormProps) {
  const queryClient = useQueryClient();
  const { hideModal, updateModal } = useModal();
  const { addToast } = useToast();
  const reactId = useId();

  const { register, control, handleSubmit, setValue } =
    useForm<CouponInfoValues>({
      mode: "onChange",
      resolver: zodResolver(couponInfoObjectSchema),
      defaultValues: {
        place: coupon.place,
        name: coupon.name,
        expire_at: coupon.expire_at.slice(0, 10),
      },
    });

  const [currentPlace = "", currentName = ""] = useWatch({
    control,
    name: ["place", "name"],
  });

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
    updateCoupon({ couponId: coupon.id, changes: data });
  };

  const onInvalid: SubmitErrorHandler<CouponInfoValues> = (errors) => {
    const first =
      errors.place?.message ??
      errors.name?.message ??
      errors.expire_at?.message;
    if (first) addToast({ message: String(first) });
  };

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit, onInvalid)}>
      <div className="flex flex-col gap-3 text-left text-black">
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
      </div>
    </form>
  );
}

export default EditCouponForm;
