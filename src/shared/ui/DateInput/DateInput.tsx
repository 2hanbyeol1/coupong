"use client";
import { forwardRef, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays } from "lucide-react";

import { parseDateInputValue } from "@/shared/lib/util/date";

import { BottomSheet } from "../BottomSheet";
import { Calendar } from "../Calendar";

interface DateInputProps {
  label: string;
  required?: boolean;
  name?: string;
  /**
   * 완성된 날짜면 YYYY-MM-DD, 입력 중이거나 없는 날짜면 화면에 보이는 그대로(2026년 1 등)
   * 그래서 폼 검증에서 YYYY-MM-DD 형식인지로 입력 완료 여부를 확인할 수 있음
   */
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  /** 고를 수 있는 가장 이른 날짜 (YYYY-MM-DD) */
  min?: string;
  errorMessage?: string;
}

const MAX_DIGITS = 8;

/**
 * 숫자만 받아 "2026년 12월 31일" 모양으로 표시
 * 연·월·일 자리를 다 채웠을 때만 단위를 붙임 (예: 2026년 1 → 2026년 12월)
 */
const formatDigits = (digits: string) => {
  const parts = [
    { value: digits.slice(0, 4), size: 4, unit: "년" },
    { value: digits.slice(4, 6), size: 2, unit: "월" },
    { value: digits.slice(6, 8), size: 2, unit: "일" },
  ];
  return parts
    .filter(({ value }) => value)
    .map(({ value, size, unit }) =>
      value.length === size ? `${value}${unit}` : value,
    )
    .join(" ");
};

const toFormValue = (digits: string) => {
  if (digits.length === MAX_DIGITS) {
    const value = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
    if (parseDateInputValue(value)) return value;
  }
  return formatDigits(digits);
};

const toDisplayValue = (value: string) =>
  parseDateInputValue(value) ? formatDigits(value.replace(/-/g, "")) : value;

/**
 * 날짜 입력칸
 * 숫자 키패드로 20261231처럼 입력하면 2026년 12월 31일로 표시되고,
 * 오른쪽 달력 버튼을 누르면 달력에서 고를 수 있음
 */
const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  (
    { label, required, name, value = "", onChange, onBlur, min, errorMessage },
    ref,
  ) => {
    const id = useId();
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // 화면 이동 애니메이션(transform) 안에 있어도 화면 전체를 덮도록 시트는 body에 렌더링
    useEffect(() => {
      setIsMounted(true);
    }, []);

    const displayValue = toDisplayValue(value);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value;
      let digits = raw.replace(/\D/g, "").slice(0, MAX_DIGITS);
      // 단위(년·월·일)나 공백만 지웠으면 숫자가 그대로라 다시 생기므로, 앞 숫자까지 함께 지움
      const previousDigits = displayValue.replace(/\D/g, "");
      if (digits === previousDigits && raw.length < displayValue.length) {
        digits = digits.slice(0, -1);
      }
      onChange(toFormValue(digits));
    };

    const handleCalendarSelect = (date: string) => {
      onChange(date);
      onBlur?.();
      setIsCalendarOpen(false);
    };

    return (
      <div>
        <div className="flex flex-col gap-1">
          <label htmlFor={id} className="text-dark text-start text-sm">
            {label}
            {required && <span className="text-error"> *</span>}
          </label>
          <div className="relative">
            <input
              id={id}
              ref={ref}
              name={name}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="YYYY년 MM월 DD일"
              value={displayValue}
              onChange={handleChange}
              onBlur={onBlur}
              className="ring-light focus:ring-primary w-full rounded-md py-2 pr-12 pl-4 text-black ring-1 placeholder:text-black/30 focus:ring-2"
            />
            <button
              type="button"
              onClick={() => setIsCalendarOpen(true)}
              aria-label="달력에서 날짜 고르기"
              className="text-dark absolute inset-y-0 right-0 flex w-12 cursor-pointer items-center justify-center"
            >
              <CalendarDays size={20} />
            </button>
          </div>
        </div>
        <div className="text-error mt-1 text-start">{errorMessage}</div>

        {isMounted &&
          createPortal(
            <BottomSheet
              open={isCalendarOpen}
              onClose={() => setIsCalendarOpen(false)}
              title={label}
            >
              <Calendar
                value={value}
                min={min}
                onSelect={handleCalendarSelect}
              />
            </BottomSheet>,
            document.body,
          )}
      </div>
    );
  },
);

DateInput.displayName = "DateInput";

export default DateInput;
