"use client";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { LayoutGrid } from "lucide-react";
import Image from "next/image";

import { searchCouponSuggestionsOption } from "@/entities/coupon/api/query";
import { COUPON_IMAGE_ASPECT_CLASS } from "@/entities/coupon/constants";
import { COUPON_INFO } from "@/entities/coupon/lib/schema";
import useCouponAutocomplete, {
  CouponAutocompleteField,
} from "@/entities/coupon/model/useCouponAutocomplete";
import { useOrganizationStore } from "@/entities/organization/model/store";
import {
  AddCouponFormValues,
  CouponInfoFormValues,
} from "@/features/add-coupon/lib/schema";
import {
  COUPON_INFO_FIELD_ORDER,
  isCouponInfoIncomplete,
} from "@/features/add-coupon/lib/util";
import useIsKeyboardOpen from "@/shared/lib/hook/useIsKeyboardOpen";
import useModal from "@/shared/lib/hook/useModal";
import useToast from "@/shared/lib/hook/useToast";
import { cn } from "@/shared/lib/util/cn";
import {
  formatKoreanDate,
  getTodayDateInputValue,
  parseDateInputValue,
} from "@/shared/lib/util/date";
import {
  AutocompleteList,
  Button,
  DateInput,
  SuggestionChips,
  TextInput,
} from "@/shared/ui";

import BatchCouponInputs, {
  FIELD_LABELS,
  InfoFieldName,
} from "./BatchCouponInputs";
import CouponImageCarousel from "./CouponImageCarousel";
import CouponListBottomSheet from "./CouponListBottomSheet";
import { focusNextField } from "./fieldNavigation";
import { CouponInputMode, DEFAULT_SHARED_FIELDS } from "./inputMode";
import SharedValueChoice, { SharedValueOption } from "./SharedValueChoice";
import ValueSwapOverlay, { SwapText } from "./ValueSwapOverlay";

interface CouponInfoInputsProps {
  imagePreviews: string[];
  currentIndex: number;
  onCurrentIndexChange: (index: number) => void;
  isSubmitting: boolean;
  submitLabel: string;
  /** 첫 번째 쿠폰에서 '이전'을 누르면 사진 선택 단계로 돌아감 */
  onBackToImages: () => void;
  /** 사진 선택 단계에 다녀와도 유지되도록 입력 방식·같이 쓰는 항목은 바깥에서 관리 */
  inputMode: CouponInputMode;
  onInputModeChange: (mode: CouponInputMode) => void;
  sharedFields: InfoFieldName[];
  onSharedFieldsChange: Dispatch<SetStateAction<InfoFieldName[]>>;
}

const INPUT_CONFIG = [
  { ...COUPON_INFO.place },
  { ...COUPON_INFO.name },
  { ...COUPON_INFO.expire_at },
] as const;

/** 날짜 칸이 비어 있을 때 보이는 안내 문구 (DateInput과 같게) */
const DATE_PLACEHOLDER = "YYYY년 MM월 DD일";

/**
 * 마지막 글자 받침에 맞는 조사를 붙임 (쿠폰 이름을·사용처를, 쿠폰 이름으로·사용처로)
 * '으로'는 받침이 ㄹ이면 '로'
 */
const withParticle = (word: string, withBatchim: string, without: string) => {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  if (code < 0 || code > 11171) return word + without;
  const batchim = code % 28;
  const hasBatchim =
    batchim !== 0 && !(withBatchim === "으로" && batchim === 8);
  return word + (hasBatchim ? withBatchim : without);
};

/** 쿠폰 한 장의 입력칸에 보이는 글자 (입력칸 순서대로) */
const getFieldTexts = (
  coupon: Partial<CouponInfoFormValues> | undefined,
): SwapText[] =>
  INPUT_CONFIG.map((config) => {
    const name = config.name as InfoFieldName;
    if (name === "expire_at") {
      const value = coupon?.expire_at ?? "";
      return parseDateInputValue(value)
        ? { text: formatKoreanDate(value), isPlaceholder: false }
        : { text: DATE_PLACEHOLDER, isPlaceholder: true };
    }
    return { text: coupon?.[name] ?? "", isPlaceholder: false };
  });

/** 입력 방식 전환 버튼 (한 번에 입력이 기본이라 앞에) */
const INPUT_MODE_OPTIONS = [
  ["batch", "한 번에 입력"],
  ["single", "따로 입력"],
] as const satisfies readonly (readonly [CouponInputMode, string])[];

/** 입력 방식 선택 표시가 옮겨 가는 움직임 */
const INPUT_MODE_INDICATOR_SPRING = {
  type: "spring",
  stiffness: 500,
  damping: 38,
} as const;

type AutocompleteFieldName = CouponAutocompleteField;

const AUTOCOMPLETE_FIELDS: InfoFieldName[] = ["place", "name"];
const MAX_PLACE_SUGGESTIONS = 5;
const MAX_NAME_SUGGESTIONS = 10;
/** 다음 쿠폰으로 넘어가는 슬라이드가 끝난 뒤 첫 칸에 포커스 */
const FOCUS_AFTER_SLIDE_MS = 200;

function CouponInfoInputs({
  imagePreviews,
  currentIndex,
  onCurrentIndexChange,
  isSubmitting,
  submitLabel,
  onBackToImages,
  inputMode,
  onInputModeChange,
  sharedFields,
  onSharedFieldsChange,
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
  const { showModal, hideModal } = useModal();
  const { selectedOrganizationId } = useOrganizationStore();
  const today = useMemo(() => getTodayDateInputValue(), []);
  const shouldReduceMotion = useReducedMotion();

  const [isListOpen, setIsListOpen] = useState(false);
  // 키보드가 열려 입력 중이면 사진을 작은 카드로 접어, 입력 중인 쿠폰이 계속 보이게 함
  const isKeyboardOpen = useIsKeyboardOpen();
  const [isTyping, setIsTyping] = useState(false);
  const isImageCompact = isKeyboardOpen && isTyping;
  // Enter로 다음 쿠폰에 넘어갔으면, 넘어간 쿠폰의 첫 칸에 포커스
  const shouldFocusFirstFieldRef = useRef(false);
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

  // 쿠폰이 바뀌면 입력칸 위에 이전·새 글자를 겹쳐 그려, 이전 글자는 위로 빠지고 새 글자는 아래에서 올라옴
  // (입력칸은 쿠폰마다 새로 그려져 이전 글자가 남지 않으므로, 바뀌는 순간의 두 값을 기억해 둠)
  const fieldsRef = useRef<HTMLDivElement>(null);
  const [valueSwap, setValueSwap] = useState<{
    id: number;
    items: { from: SwapText; to: SwapText }[];
  } | null>(null);
  const [swapBase, setSwapBase] = useState({ index: currentIndex, inputMode });
  if (swapBase.index !== currentIndex || swapBase.inputMode !== inputMode) {
    setSwapBase({ index: currentIndex, inputMode });
    // 한 번에 입력에서 사진을 눌러 넘어온 경우처럼 입력 방식이 바뀌었으면 애니메이션 없이 바로 보여줌
    const isModeChanged = swapBase.inputMode !== inputMode;
    if (!shouldReduceMotion && !isModeChanged && inputMode === "single") {
      const from = getFieldTexts(couponsWatch?.[swapBase.index]);
      const to = getFieldTexts(couponsWatch?.[currentIndex]);
      setValueSwap((prev) => ({
        id: (prev?.id ?? 0) + 1,
        items: from.map((text, index) => ({ from: text, to: to[index] })),
      }));
    }
  }

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
  const {
    items: autocompleteResult,
    field: autocompleteResultField,
    isLoading: isAutocompleteLoading,
  } = useCouponAutocomplete({
    organizationId: selectedOrganizationId,
    field: autocompleteField,
    query: autocompleteQuery,
    // 쿠폰 이름은 지금 입력한 사용처에서 쓰였던 이름을 먼저
    place: currentPlace,
    sessionValues,
  });

  const handleSuggestionClick = (
    field: AutocompleteFieldName,
    value: string,
  ) => {
    setValue(`coupons.${currentIndex}.${field}`, value, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleAutocompleteSelect = (
    field: AutocompleteFieldName,
    value: string,
  ) => {
    setValue(`coupons.${currentIndex}.${field}`, value, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setAutocompleteField(null);
  };

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === imagePreviews.length - 1;
  const hasMultiple = imagePreviews.length > 1;

  /** 지금 쿠폰을 검사하고, 잘못된 칸이 있으면 알려주고 그 칸으로 포커스 */
  const validateCurrentCoupon = async () => {
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
    }
    return valid;
  };

  const handleNext = async () => {
    if (!(await validateCurrentCoupon())) return;
    onCurrentIndexChange(Math.min(imagePreviews.length - 1, currentIndex + 1));
  };

  /** 사진을 누르거나 여러 장을 밀어 원하는 쿠폰으로 이동. 앞으로 갈 때는 지금 쿠폰을 먼저 검사 */
  const handleGoTo = async (index: number) => {
    if (index === currentIndex) return;
    if (index > currentIndex && !(await validateCurrentCoupon())) return;
    onCurrentIndexChange(index);
  };

  const handlePrev = () => {
    onCurrentIndexChange(Math.max(0, currentIndex - 1));
  };

  // 첫 번째 쿠폰이면 사진 선택 단계로, 아니면 이전 쿠폰으로
  const handlePrevButtonClick = isFirst ? onBackToImages : handlePrev;

  const isCurrentDateFilled = !!couponsWatch?.[currentIndex]?.expire_at;

  // 다음 쿠폰으로 넘어간 뒤 슬라이드가 끝나면 첫 칸에 포커스
  useEffect(() => {
    if (!shouldFocusFirstFieldRef.current) return;
    shouldFocusFirstFieldRef.current = false;
    const timer = setTimeout(
      () => setFocus(`coupons.${currentIndex}.place`),
      FOCUS_AFTER_SLIDE_MS,
    );
    return () => clearTimeout(timer);
  }, [currentIndex, setFocus]);

  /**
   * 키보드의 다음(Enter)은 폼을 제출하지 않고 사용처 → 쿠폰 이름 → 유효 기간 → 다음 쿠폰 첫 칸 순서로 이동
   * 마지막 쿠폰을 다 입력했으면 등록 확인으로
   */
  const handleSingleKeyDown = async (
    event: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key !== "Enter" || !(event.target instanceof HTMLInputElement))
      return;
    event.preventDefault();
    const input = event.target;
    const isNameField = input.name === `coupons.${currentIndex}.name`;

    // 유효 기간까지 채웠으면 쿠폰 이름에서 바로 다음 쿠폰으로
    if (!(isNameField && isCurrentDateFilled)) {
      if (focusNextField(input, event.currentTarget)) return;
    }

    if (isLast) {
      input.form?.requestSubmit();
      return;
    }
    shouldFocusFirstFieldRef.current = true;
    await handleNext();
  };

  /** 한 번에 입력에서 사진을 누르면 그 쿠폰을 따로 입력 */
  const handleEditCouponSeparately = (index: number) => {
    onCurrentIndexChange(index);
    onInputModeChange("single");
  };

  const handleSelectFromList = (index: number) => {
    onCurrentIndexChange(index);
    setIsListOpen(false);
  };

  /**
   * 쿠폰들에 입력된 서로 다른 값 (빈 칸 제외)
   * 많은 쿠폰에 입력된 값부터, 같으면 앞 쿠폰에 먼저 나온 값부터
   */
  const getValueOptions = (field: InfoFieldName): SharedValueOption[] => {
    const coupons = getValues("coupons") ?? [];
    const options = new Map<string, SharedValueOption>();
    coupons.forEach((coupon) => {
      const value = coupon?.[field] ?? "";
      if (!value.trim()) return;
      const option = options.get(value);
      if (option) {
        option.count += 1;
      } else {
        const label = field === "expire_at" ? formatKoreanDate(value) : value;
        options.set(value, { value, label, count: 1 });
      }
    });
    // Map은 넣은 순서를 지키고 sort는 안정 정렬이라, 개수가 같으면 앞에 나온 값이 앞에 남음
    return [...options.values()].sort((a, b) => b.count - a.count);
  };

  /** 같이 쓸 기본 값: 가장 많이 입력된 값, 같으면 앞 쿠폰의 값 (빈 칸으로 덮어쓰지 않도록) */
  const getSharedSourceValue = (field: InfoFieldName) =>
    getValueOptions(field)[0]?.value ?? "";

  /** 같이 쓰면 값이 바뀌는(다른 값이 입력된) 쿠폰 번호 */
  const getConflictingIndexes = (fields: InfoFieldName[]) => {
    const coupons = getValues("coupons") ?? [];
    const indexes = new Set<number>();
    fields.forEach((field) => {
      const shared = getSharedSourceValue(field);
      coupons.forEach((coupon, index) => {
        const value = coupon?.[field] ?? "";
        if (value.trim() && value !== shared) indexes.add(index);
      });
    });
    return [...indexes];
  };

  /** 모든 쿠폰의 한 항목을 같은 값으로 */
  const setValueForAll = (field: InfoFieldName, value: string) => {
    const coupons = getValues("coupons") ?? [];
    coupons.forEach((_, index) => {
      setValue(`coupons.${index}.${field}`, value, {
        shouldValidate: !!value,
        shouldDirty: true,
      });
    });
  };

  const applySharedValues = (fields: InfoFieldName[]) => {
    fields.forEach((field) =>
      setValueForAll(field, getSharedSourceValue(field)),
    );
  };

  const applySharedValuesRef = useRef(applySharedValues);
  applySharedValuesRef.current = applySharedValues;

  /**
   * 한 번에 입력으로 바꿈. 묻지 않고 입력한 내용은 그대로 둠
   * 쿠폰마다 다른 값을 입력한 항목은 '모두 같게'를 끈 채로 두고, 나머지만 같이 씀
   */
  const switchToBatch = () => {
    const shared = DEFAULT_SHARED_FIELDS.filter(
      (field) => getConflictingIndexes([field]).length === 0,
    );
    applySharedValues(shared);
    onSharedFieldsChange(shared);
    onInputModeChange("batch");
  };

  /** 같이 쓸 항목을 켜고 끔. 켤 때 쿠폰마다 입력한 값이 다르면 어떤 값으로 같게 할지 고름 */
  const toggleSharedField = (field: InfoFieldName) => {
    if (sharedFields.includes(field)) {
      onSharedFieldsChange((prev) => prev.filter((f) => f !== field));
      return;
    }
    const share = (value: string) => {
      setValueForAll(field, value);
      onSharedFieldsChange((prev) => [...prev, field]);
    };
    const options = getValueOptions(field);
    if (options.length <= 1) {
      share(options[0]?.value ?? "");
      return;
    }
    // 고른 값은 모달 안에서 바뀌므로, 확인을 누를 때 읽을 수 있게 따로 담아 둠
    const choice = { value: options[0].value };
    const label = FIELD_LABELS[field];
    showModal({
      title: `어떤 ${withParticle(label, "으로", "로")} 같게 할까요?`,
      content: (
        <div className="flex flex-col gap-3">
          <p className="break-keep">
            선택된 값으로 모든 {withParticle(label, "을", "를")} 바꿔요.
          </p>
          <SharedValueChoice
            options={options}
            defaultValue={choice.value}
            onChange={(value) => {
              choice.value = value;
            }}
          />
        </div>
      ),
      confirmButtonText: "같게 하기",
      onConfirm: () => {
        hideModal();
        share(choice.value);
      },
    });
  };

  const isBatch = hasMultiple && inputMode === "batch";

  // 한 번에 입력 중에 사진을 더 고르면, 새 쿠폰에도 같이 쓰는 값을 채움
  const couponCount = couponsWatch?.length ?? 0;
  useEffect(() => {
    if (!isBatch || couponCount === 0) return;
    applySharedValuesRef.current(sharedFields);
    // 같이 쓰는 항목이 바뀔 때는 toggleSharedField에서 처리하므로 쿠폰 수가 바뀔 때만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBatch, couponCount]);

  // 따로 입력은 지금 몇 번째 쿠폰인지(+ 입력한 정도), 한 번에 입력은 모든 쿠폰의 칸을 얼마나 채웠는지
  const filledFieldCount = imagePreviews.reduce(
    (count, _, index) =>
      count +
      COUPON_INFO_FIELD_ORDER.filter(
        (field) => !!couponsWatch?.[index]?.[field]?.trim(),
      ).length,
    0,
  );
  const totalFieldCount = imagePreviews.length * COUPON_INFO_FIELD_ORDER.length;
  const progress = isBatch
    ? {
        value: filledFieldCount,
        max: totalFieldCount,
        text: `${totalFieldCount}칸 중 ${filledFieldCount}칸 입력`,
      }
    : {
        value: currentIndex + 1,
        max: imagePreviews.length,
        text: `${imagePreviews.length}개 중 ${currentIndex + 1}번째 쿠폰, ${totalFieldCount}칸 중 ${filledFieldCount}칸 입력`,
      };
  const filledRatio = totalFieldCount ? filledFieldCount / totalFieldCount : 0;

  return (
    <div className="flex h-full flex-col gap-4">
      {/* 헤더 바로 아래 얇은 진행 바 */}
      {hasMultiple && (
        <div
          role="progressbar"
          aria-label="쿠폰 정보 입력 진행"
          aria-valuemin={0}
          aria-valuemax={progress.max}
          aria-valuenow={progress.value}
          aria-valuetext={progress.text}
          className="bg-light relative -mx-4 -mt-4 h-0.5 shrink-0"
        >
          {/* 따로 입력: 입력한 정도는 연한 초록, 지금 쿠폰 위치는 그 위에 진한 초록 */}
          {!isBatch && (
            <div
              className="bg-primary/30 absolute inset-y-0 left-0 transition-[width] duration-300 ease-out"
              style={{ width: `${filledRatio * 100}%` }}
            />
          )}
          <div
            className="bg-primary absolute inset-y-0 left-0 transition-[width] duration-300 ease-out"
            style={{ width: `${(progress.value / progress.max) * 100}%` }}
          />
        </div>
      )}

      {/* 체크박스 대신 모드 전환: 제목·버튼도 모드에 맞게 바뀜 */}
      {hasMultiple && (
        <div
          role="radiogroup"
          aria-label="입력 방식"
          className="bg-light grid shrink-0 grid-cols-2 gap-1 rounded-xl p-1"
        >
          {INPUT_MODE_OPTIONS.map(([mode, label]) => {
            const isSelected = inputMode === mode;
            return (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => {
                  if (isSelected) return;
                  if (mode === "batch") switchToBatch();
                  else onInputModeChange("single");
                }}
                className={cn(
                  "relative h-9 cursor-pointer rounded-lg text-sm transition-colors duration-200",
                  isSelected ? "text-ink font-semibold" : "text-dark",
                )}
              >
                {/* 선택 표시(밝은 배경)가 고른 쪽으로 미끄러져 이동 */}
                {isSelected && (
                  <motion.span
                    layoutId={`${reactId}-input-mode`}
                    aria-hidden
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : INPUT_MODE_INDICATOR_SPRING
                    }
                    className="bg-elevated absolute inset-0 rounded-lg shadow-sm"
                  />
                )}
                <span className="relative">{label}</span>
              </button>
            );
          })}
        </div>
      )}

      {isBatch ? (
        <>
          <h1 className="shrink-0 text-2xl leading-snug font-semibold break-keep">
            {imagePreviews.length}개 쿠폰을 한 번에 입력해요
          </h1>
          <div className="-mx-4 min-h-0 flex-1 overflow-y-auto px-4 pb-1">
            <BatchCouponInputs
              imagePreviews={imagePreviews}
              onSelectCoupon={handleEditCouponSeparately}
              sharedFields={sharedFields}
              onToggleSharedField={toggleSharedField}
              anchorIndex={currentIndex}
              placeSuggestions={placeSuggestions}
              nameSuggestions={nameSuggestions}
              today={today}
            />
          </div>
          <Button
            type="submit"
            size="lg"
            full
            disabled={isSubmitting}
            className="shrink-0"
          >
            {submitLabel}
          </Button>
        </>
      ) : (
        <>
          <div className="flex shrink-0 items-center gap-1">
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

          {/* 키보드가 열리면 사진을 작은 카드로 접음 */}
          {isImageCompact ? (
            <CompactCouponImage
              url={imagePreviews[currentIndex]}
              label={hasMultiple ? `${currentIndex + 1}번째 쿠폰` : "쿠폰"}
            />
          ) : (
            <CouponImageCarousel
              imagePreviews={imagePreviews}
              currentIndex={currentIndex}
              onSelect={handleGoTo}
            />
          )}

          {/* 사진은 캐러셀이 옮기고, 입력칸은 박스·라벨은 그대로 둔 채 값 글자만 위로 바뀜 */}
          <div ref={fieldsRef} className="relative shrink-0">
            <div
              // 아래 겹침 레이어와 같은 부모라 키가 겹치지 않도록 접두어를 붙임
              key={`fields-${currentIndex}`}
              className={cn(
                "flex flex-col gap-3",
                // 글자가 바뀌는 동안은 겹쳐 그린 글자만 보이도록 실제 글자를 숨김
                valueSwap &&
                  "[&_[aria-haspopup=dialog]>span]:opacity-0 [&_input]:text-transparent",
              )}
              onKeyDown={handleSingleKeyDown}
              onFocus={(event) =>
                setIsTyping(event.target instanceof HTMLInputElement)
              }
              onBlur={(event) => {
                // 다음 입력칸으로 옮겨 가는 중이면 접힌 사진을 유지
                if (!(event.relatedTarget instanceof HTMLInputElement))
                  setIsTyping(false);
              }}
            >
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
                          onBlur={field.onBlur}
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
                        type={type}
                        placeholder={placeholder}
                        autoComplete={isAutocompleteField ? "off" : undefined}
                        // 마지막 쿠폰의 마지막 칸에서만 '완료', 나머지는 '다음'
                        enterKeyHint={
                          fieldName === "name" && isLast && isCurrentDateFilled
                            ? "done"
                            : "next"
                        }
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
                        onSelect={(value) =>
                          handleSuggestionClick("name", value)
                        }
                      />
                    )}
                  </div>
                );
              })}
            </div>
            {valueSwap && (
              <ValueSwapOverlay
                key={`swap-${valueSwap.id}`}
                containerRef={fieldsRef}
                items={valueSwap.items}
                onDone={() => setValueSwap(null)}
              />
            )}
          </div>

          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              onClick={handlePrevButtonClick}
              color="light"
              size="lg"
              className="flex-1"
            >
              이전
            </Button>
            {isLast ? (
              <Button
                key="submit"
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="flex-[2]"
              >
                {submitLabel}
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
        </>
      )}

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

/** 키보드가 열렸을 때 사진 대신 보여주는 작은 카드 */
function CompactCouponImage({
  url,
  label,
}: {
  url: string | undefined;
  label: string;
}) {
  return (
    <div className="bg-light/60 flex shrink-0 items-center gap-3 rounded-xl p-2">
      <div
        className={cn(
          "bg-surface relative h-16 shrink-0 overflow-hidden rounded-md",
          COUPON_IMAGE_ASPECT_CLASS,
        )}
      >
        {url && <Image src={url} alt={label} fill className="object-contain" />}
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[15px] font-semibold">{label}</span>
        <span className="text-dark text-sm">
          입력하는 동안 사진은 작게 보여요
        </span>
      </div>
    </div>
  );
}

export default CouponInfoInputs;
