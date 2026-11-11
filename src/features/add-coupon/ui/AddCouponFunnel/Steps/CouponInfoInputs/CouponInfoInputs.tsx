"use client";
import { useEffect, useId, useMemo, useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, PanInfo, Variants } from "framer-motion";
import { LayoutGrid } from "lucide-react";
import Image from "next/image";

import { searchCouponSuggestionsOption } from "@/entities/coupon/api/query";
import { COUPON_IMAGE_ASPECT_CLASS } from "@/entities/coupon/constants";
import { COUPON_INFO } from "@/entities/coupon/lib/schema";
import { useOrganizationStore } from "@/entities/organization/model/store";
import {
  AddCouponFormValues,
  CouponInfoFormValues,
} from "@/features/add-coupon/lib/schema";
import {
  COUPON_INFO_FIELD_ORDER,
  isCouponInfoIncomplete,
} from "@/features/add-coupon/lib/util";
import useDebouncedValue from "@/shared/lib/hook/useDebouncedValue";
import useSlideDirection from "@/shared/lib/hook/useSlideDirection";
import useToast from "@/shared/lib/hook/useToast";
import { cn } from "@/shared/lib/util/cn";
import { getTodayDateInputValue } from "@/shared/lib/util/date";
import { Button, Checkbox, DateInput, TextInput } from "@/shared/ui";

import AutocompleteList from "./AutocompleteList";
import CouponListBottomSheet from "./CouponListBottomSheet";
import SuggestionChips from "./SuggestionChips";

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

type AutocompleteFieldName = "place" | "name";

const AUTOCOMPLETE_FIELDS: InfoFieldName[] = ["place", "name"];
const MAX_PLACE_SUGGESTIONS = 5;
const MAX_NAME_SUGGESTIONS = 10;
const MAX_AUTOCOMPLETE_ITEMS = 5;
const AUTOCOMPLETE_DEBOUNCE_MS = 250;
const SWIPE_THRESHOLD = 50;

// 다음 쿠폰은 오른쪽에서, 이전 쿠폰은 왼쪽에서 들어옴
const couponVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "30%" : "-30%",
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? "-30%" : "30%",
    opacity: 0,
  }),
};

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
    setFocus,
    getFieldState,
    control,
    formState: { errors },
  } = useFormContext<AddCouponFormValues>();

  const reactId = useId();
  const { addToast } = useToast();
  const { selectedOrganizationId } = useOrganizationStore();
  const direction = useSlideDirection(currentIndex);
  const today = useMemo(() => getTodayDateInputValue(), []);

  const [applyAll, setApplyAll] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  // 자동완성 목록을 띄울 입력칸
  // 포커스만 했을 때는 검색하지 않고, 글자를 입력해야 열림 (포커스가 빠지면 닫힘)
  const [autocompleteField, setAutocompleteField] =
    useState<AutocompleteFieldName | null>(null);

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

  const couponsWatch = useWatch({ control, name: "coupons" });

  const incompleteCoupons = useMemo(
    () =>
      imagePreviews.map((_, index) =>
        isCouponInfoIncomplete(couponsWatch?.[index], errors.coupons?.[index]),
      ),
    [imagePreviews, couponsWatch, errors.coupons],
  );

  // 이번에 입력한 다른 쿠폰의 값을 자동완성 후보로 수집
  const sessionValues = useMemo(() => {
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

  const currentPlace = couponsWatch?.[currentIndex]?.place ?? "";
  const currentName = couponsWatch?.[currentIndex]?.name ?? "";
  // 사용처가 입력되어 있고 사용처를 고치는 중이 아니면 입력을 마친 것으로 봄
  const isPlaceEntered =
    currentPlace.trim() !== "" && autocompleteField !== "place";

  // 이번에 입력한 다른 쿠폰 중 같은 사용처의 쿠폰 이름
  const sessionNamesInPlace = useMemo(() => {
    const place = currentPlace.trim();
    const names = new Set<string>();
    (couponsWatch ?? []).forEach((coupon, idx) => {
      if (idx === currentIndex || coupon?.place?.trim() !== place) return;
      if (coupon.name?.trim()) names.add(coupon.name);
    });
    return [...names];
  }, [couponsWatch, currentIndex, currentPlace]);

  // 사용처 추천 태그: 이번에 입력한 값 → 그룹에서 많이 쓴 순 (중복 제거·정렬은 서버에서)
  const { data: placeSuggestions = [] } = useQuery(
    searchCouponSuggestionsOption({
      organizationId: selectedOrganizationId,
      field: "place",
      sessionValues: sessionValues.place,
      limit: MAX_PLACE_SUGGESTIONS,
    }),
  );

  // 쿠폰 이름 추천 태그: 그 사용처로 등록했던 쿠폰 이름만
  const { data: nameSuggestions = [] } = useQuery(
    searchCouponSuggestionsOption(
      {
        organizationId: selectedOrganizationId,
        field: "name",
        place: currentPlace.trim(),
        placeOnly: true,
        sessionValues: sessionNamesInPlace,
        limit: MAX_NAME_SUGGESTIONS,
      },
      { enabled: isPlaceEntered },
    ),
  );

  // 자동완성: 입력이 잠시 멈추면 포커스된 칸의 값으로 서버에서 검색
  const autocompleteQuery = autocompleteField
    ? (couponsWatch?.[currentIndex]?.[autocompleteField] ?? "").trim()
    : "";
  const autocompleteParams = useMemo(
    () => ({
      field: autocompleteField,
      query: autocompleteQuery,
      // 쿠폰 이름은 지금 입력한 사용처에서 쓰였던 이름을 먼저
      place: autocompleteField === "name" ? currentPlace : "",
    }),
    [autocompleteField, autocompleteQuery, currentPlace],
  );
  const debouncedParams = useDebouncedValue(
    autocompleteParams,
    AUTOCOMPLETE_DEBOUNCE_MS,
  );
  const isDebouncing = debouncedParams !== autocompleteParams;
  const { data: autocompleteResult = [], isFetching: isAutocompleteFetching } =
    useQuery(
      searchCouponSuggestionsOption(
        {
          organizationId: selectedOrganizationId,
          field: debouncedParams.field ?? "place",
          query: debouncedParams.query,
          place: debouncedParams.place,
          sessionValues: debouncedParams.field
            ? sessionValues[debouncedParams.field]
            : [],
          limit: MAX_AUTOCOMPLETE_ITEMS,
        },
        { enabled: !!debouncedParams.field && debouncedParams.query !== "" },
      ),
    );
  const isAutocompleteLoading = isDebouncing || isAutocompleteFetching;

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

  const handleSuggestionClick = (
    field: AutocompleteFieldName,
    value: string,
  ) => {
    setValue(`coupons.${currentIndex}.${field}`, value, {
      shouldValidate: true,
      shouldDirty: true,
    });
    handleFieldBlur(field);
  };

  const handleAutocompleteSelect = (
    field: AutocompleteFieldName,
    value: string,
  ) => {
    setValue(`coupons.${currentIndex}.${field}`, value, {
      shouldValidate: true,
      shouldDirty: true,
    });
    handleFieldBlur(field);
    setAutocompleteField(null);
  };

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === imagePreviews.length - 1;
  const hasMultiple = imagePreviews.length > 1;

  const handleNext = async () => {
    const valid = await trigger(`coupons.${currentIndex}`);
    if (!valid) {
      // 첫 번째로 잘못된 칸의 에러를 토스트로 알려주고 그 칸으로 포커스
      for (const field of COUPON_INFO_FIELD_ORDER) {
        const name = `coupons.${currentIndex}.${field}` as const;
        const message = getFieldState(name).error?.message;
        if (message) {
          addToast({ message });
          setFocus(name);
          break;
        }
      }
      return;
    }
    onCurrentIndexChange(Math.min(imagePreviews.length - 1, currentIndex + 1));
  };

  const handlePrev = () => {
    onCurrentIndexChange(Math.max(0, currentIndex - 1));
  };

  const handleSwipeEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD && !isLast) handleNext();
    else if (info.offset.x > SWIPE_THRESHOLD && !isFirst) handlePrev();
  };

  const handleSelectFromList = (index: number) => {
    onCurrentIndexChange(index);
    setIsListOpen(false);
  };

  return (
    <div className="flex h-full flex-col gap-4">
      {/* 헤더 바로 아래 얇은 진행 바 */}
      {hasMultiple && (
        <div
          role="progressbar"
          aria-label="쿠폰 정보 입력 진행"
          aria-valuemin={1}
          aria-valuemax={imagePreviews.length}
          aria-valuenow={currentIndex + 1}
          className="bg-light -mx-4 -mt-4 h-0.5 shrink-0"
        >
          <div
            className="bg-primary h-full transition-[width] duration-300 ease-out"
            style={{
              width: `${((currentIndex + 1) / imagePreviews.length) * 100}%`,
            }}
          />
        </div>
      )}

      <div className="flex items-center gap-1">
        <h1 className="text-2xl leading-snug font-semibold break-keep">
          {hasMultiple ? `${currentIndex + 1}번째 쿠폰` : "쿠폰"} 정보를
          알려주세요
        </h1>
        {hasMultiple && (
          <button
            type="button"
            onClick={() => setIsListOpen(true)}
            aria-label="쿠폰 목록 보기"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center"
          >
            <LayoutGrid size={20} />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={couponVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="flex min-h-0 flex-1 flex-col gap-4"
        >
          {/* 양옆에 이전/다음 쿠폰을 흐리게 보여주고, 좌우로 밀어 이동 */}
          <div className="-mx-4 flex min-h-0 flex-1 overflow-hidden">
            <motion.div
              drag={hasMultiple ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleSwipeEnd}
              className="flex h-full w-full touch-pan-y justify-center gap-3"
            >
              {[currentIndex - 1, currentIndex, currentIndex + 1].map(
                (index) => {
                  const url = imagePreviews[index];
                  const isCurrent = index === currentIndex;
                  return (
                    <div
                      key={index}
                      aria-hidden={!isCurrent}
                      className={cn(
                        "relative h-full shrink-0",
                        COUPON_IMAGE_ASPECT_CLASS,
                        !isCurrent && "opacity-30",
                      )}
                    >
                      {url && (
                        <Image
                          src={url}
                          alt={isCurrent ? `쿠폰 이미지 ${index + 1}` : ""}
                          fill
                          draggable={false}
                          className="object-contain"
                        />
                      )}
                    </div>
                  );
                },
              )}
            </motion.div>
          </div>

          <div className="flex flex-col gap-3">
            {INPUT_CONFIG.map(({ name, type, placeholder, ...props }) => {
              const fieldName = name as InfoFieldName;
              if (fieldName === "expire_at") {
                return (
                  <Controller
                    key={fieldName}
                    control={control}
                    name={`coupons.${currentIndex}.expire_at`}
                    render={({ field }) => (
                      <DateInput
                        ref={field.ref}
                        name={field.name}
                        label={COUPON_INFO.expire_at.label}
                        required={COUPON_INFO.expire_at.required}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={() => {
                          field.onBlur();
                          handleFieldBlur("expire_at");
                        }}
                        min={today}
                      />
                    )}
                  />
                );
              }
              const isAutocompleteField =
                AUTOCOMPLETE_FIELDS.includes(fieldName);
              // 입력칸이 비어 있으면 목록을 띄우지 않음
              const isAutocompleteOpen =
                autocompleteField === fieldName && autocompleteQuery !== "";
              // 다른 칸에서 검색한 결과는 보여주지 않음
              const autocompleteItems =
                isAutocompleteOpen && debouncedParams.field === fieldName
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
                      type={type}
                      placeholder={placeholder}
                      autoComplete={isAutocompleteField ? "off" : undefined}
                      aria-controls={showAutocomplete ? listId : undefined}
                      onKeyDown={
                        isAutocompleteField
                          ? (event) => {
                              if (event.key === "Escape")
                                setAutocompleteField(null);
                            }
                          : undefined
                      }
                      {...props}
                      {...register(`coupons.${currentIndex}.${fieldName}`, {
                        onChange: () => {
                          if (isAutocompleteField)
                            setAutocompleteField(
                              fieldName as AutocompleteFieldName,
                            );
                        },
                        onBlur: () => {
                          if (isAutocompleteField) setAutocompleteField(null);
                          handleFieldBlur(fieldName);
                        },
                      })}
                    />
                    {showAutocomplete && (
                      <AutocompleteList
                        id={listId}
                        items={autocompleteItems}
                        query={autocompleteQuery}
                        isLoading={isAutocompleteLoading}
                        onSelect={(value) =>
                          handleAutocompleteSelect(
                            fieldName as AutocompleteFieldName,
                            value,
                          )
                        }
                      />
                    )}
                  </div>
                  {/* 사용처를 아직 입력하지 않았을 때만 많이 쓴 사용처 추천 */}
                  {fieldName === "place" && (
                    <SuggestionChips
                      show={currentPlace.trim() === ""}
                      items={placeSuggestions}
                      onSelect={(value) =>
                        handleSuggestionClick("place", value)
                      }
                    />
                  )}
                  {/* 사용처 입력을 마치면, 그 사용처로 등록했던 쿠폰 이름 추천 */}
                  {fieldName === "name" && (
                    <SuggestionChips
                      show={isPlaceEntered && currentName.trim() === ""}
                      items={nameSuggestions}
                      onSelect={(value) => handleSuggestionClick("name", value)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="space-y-4">
        {hasMultiple && (
          <Checkbox checked={applyAll} onChange={setApplyAll}>
            모든 쿠폰을 같은 정보로 등록할게요
          </Checkbox>
        )}

        <div className="flex gap-2">
          {hasMultiple && !isFirst && (
            <Button
              type="button"
              onClick={handlePrev}
              color="light"
              size="lg"
              className="flex-1"
            >
              이전
            </Button>
          )}
          {isLast ? (
            <Button
              key="submit"
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="flex-[2]"
            >
              {isSubmitting ? "등록 중..." : submitLabel}
            </Button>
          ) : (
            <Button
              key="next"
              type="button"
              onClick={handleNext}
              size="lg"
              className="flex-[2]"
            >
              다음
            </Button>
          )}
        </div>
      </div>

      <CouponListBottomSheet
        open={isListOpen}
        imagePreviews={imagePreviews}
        currentIndex={currentIndex}
        incompleteCoupons={incompleteCoupons}
        onSelect={handleSelectFromList}
        onClose={() => setIsListOpen(false)}
      />
    </div>
  );
}

export default CouponInfoInputs;
