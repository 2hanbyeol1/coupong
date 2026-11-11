"use client";
import { forwardRef, useId, useState } from "react";
import { CalendarDays, Keyboard } from "lucide-react";

import { cn } from "@/shared/lib/util/cn";

import { BottomSheet } from "../BottomSheet";
import { Calendar } from "../Calendar";

import { formatDateDigits, toDateDigits } from "./dateDigits";
import DirectDateInput from "./DirectDateInput";

interface DateInputProps {
  label: string;
  required?: boolean;
  name?: string;
  /** 고른 날짜 (YYYY-MM-DD), 없으면 빈 문자열 */
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  /** 고를 수 있는 가장 이른 날짜 (YYYY-MM-DD) */
  min?: string;
  errorMessage?: string;
}

/** calendar: 달력에서 고르기, text: 숫자로 직접 입력 */
type SheetMode = "calendar" | "text";

/**
 * 날짜 입력칸
 * 누르면 바텀시트에서 달력으로 고르고, 시트 아래 [직접 입력]을 누르면 숫자로 칠 수 있음
 * 직접 입력은 [YYYY]년 [MM]월 [DD]일 세 칸으로 침
 */
const DateInput = forwardRef<HTMLButtonElement, DateInputProps>(
  (
    { label, required, name, value = "", onChange, onBlur, min, errorMessage },
    ref,
  ) => {
    const id = useId();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [sheetMode, setSheetMode] = useState<SheetMode>("calendar");
    const valueDigits = toDateDigits(value);
    const displayValue = valueDigits ? formatDateDigits(valueDigits) : "";

    const openSheet = () => {
      setSheetMode("calendar");
      setIsSheetOpen(true);
    };

    const closeSheet = () => {
      setIsSheetOpen(false);
      onBlur?.();
    };

    // 달력에서 고르거나 직접 입력을 확인하면 값을 넣고 닫음
    const handleSelect = (date: string) => {
      onChange(date);
      closeSheet();
    };

    return (
      <div>
        <div className="flex flex-col gap-1">
          <label htmlFor={id} className="text-dark text-start text-sm">
            {label}
            {required && <span className="text-error"> *</span>}
          </label>
          <button
            id={id}
            ref={ref}
            name={name}
            type="button"
            onClick={openSheet}
            aria-haspopup="dialog"
            className="ring-light focus:ring-primary flex w-full cursor-pointer items-center justify-between rounded-md py-2 pr-3 pl-4 text-start ring-1 focus:ring-2"
          >
            <span className={cn(displayValue ? "text-black" : "text-black/30")}>
              {displayValue || "YYYY년 MM월 DD일"}
            </span>
            <CalendarDays className="text-dark" size={20} aria-hidden />
          </button>
        </div>
        <div className="text-error mt-1 text-start">{errorMessage}</div>

        <BottomSheet open={isSheetOpen} onClose={closeSheet} title={label}>
          {sheetMode === "calendar" ? (
            <div className="flex flex-col gap-3">
              <Calendar value={value} min={min} onSelect={handleSelect} />
              <SheetModeButton onClick={() => setSheetMode("text")}>
                <Keyboard size={16} aria-hidden />
                직접 입력
              </SheetModeButton>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <DirectDateInput
                label={label}
                initialValue={value}
                min={min}
                onConfirm={handleSelect}
              />
              <SheetModeButton onClick={() => setSheetMode("calendar")}>
                <CalendarDays size={16} aria-hidden />
                달력에서 고르기
              </SheetModeButton>
            </div>
          )}
        </BottomSheet>
      </div>
    );
  },
);

DateInput.displayName = "DateInput";

/** 시트 아래 달력 ↔ 직접 입력 전환 */
function SheetModeButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-dark mx-auto flex h-10 cursor-pointer items-center gap-1.5 rounded-full px-4 text-sm"
    >
      {children}
    </button>
  );
}

export default DateInput;
