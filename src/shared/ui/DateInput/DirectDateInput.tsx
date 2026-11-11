"use client";
import { useRef, useState } from "react";

import { cn } from "@/shared/lib/util/cn";
import { parseDateInputValue } from "@/shared/lib/util/date";

import { Button } from "../Button";

import {
  formatDateDigits,
  getLastDayOfMonth,
  parseDayInput,
  parseMonthInput,
  splitPastedDate,
  toDateDigits,
  trimLeadingZero,
} from "./dateDigits";

interface DirectDateInputProps {
  label: string;
  /** 처음 채워 둘 날짜 (YYYY-MM-DD) */
  initialValue?: string;
  /** 입력할 수 있는 가장 이른 날짜 (YYYY-MM-DD) */
  min?: string;
  onConfirm: (value: string) => void;
}

type Field = "year" | "month" | "day";

const FIELD_CLASS =
  "ring-light focus:ring-primary w-0 rounded-md py-3 text-center text-lg text-black ring-1 placeholder:text-black/30 focus:ring-2";

/**
 * [YYYY]년 [MM]월 [DD]일 세 칸으로 날짜를 직접 입력
 * 칸을 다 채우면 다음 칸으로 넘어가고, 월은 한 자리만 쳐도(3, 1.) 넘어감
 * 월·일은 앞에 0 없이 보여주고, 확인할 때 YYYY-MM-DD로 맞춤
 */
function DirectDateInput({
  label,
  initialValue = "",
  min,
  onConfirm,
}: DirectDateInputProps) {
  const initialDigits = toDateDigits(initialValue);
  const [year, setYear] = useState(initialDigits.slice(0, 4));
  const [month, setMonth] = useState(
    trimLeadingZero(initialDigits.slice(4, 6)),
  );
  const [day, setDay] = useState(trimLeadingZero(initialDigits.slice(6, 8)));
  const [error, setError] = useState("");

  const fieldRefs = {
    year: useRef<HTMLInputElement>(null),
    month: useRef<HTMLInputElement>(null),
    day: useRef<HTMLInputElement>(null),
  };
  const focusField = (field: Field) => fieldRefs[field].current?.focus();

  const canConfirm =
    year.length === 4 && !!month && month !== "0" && !!day && day !== "0";

  const handleYearChange = (raw: string) => {
    setError("");
    // 날짜를 통째로 붙여넣으면 세 칸에 나눠 넣음
    const pasted = raw.replace(/\D/g, "").length > 4 && splitPastedDate(raw);
    if (pasted) {
      setYear(pasted.year);
      setMonth(pasted.month);
      setDay(pasted.day);
      focusField("day");
      return;
    }
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    setYear(digits);
    if (digits.length === 4) focusField("month");
  };

  const handleMonthChange = (raw: string) => {
    setError("");
    const { month: nextMonth, isDone, carry } = parseMonthInput(raw);
    setMonth(nextMonth);
    if (carry) {
      setDay(parseDayInput(carry, getLastDayOfMonth(year, nextMonth)).day);
    }
    if (isDone) focusField("day");
  };

  const handleDayChange = (raw: string) => {
    setError("");
    setDay(parseDayInput(raw, getLastDayOfMonth(year, month)).day);
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    const date = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    if (!parseDateInputValue(date)) {
      setError("없는 날짜예요");
      return;
    }
    // YYYY-MM-DD는 문자열 비교로 날짜 순서를 비교할 수 있음
    if (min && date < min) {
      setError(`${formatDateDigits(toDateDigits(min))}부터 입력할 수 있어요`);
      return;
    }
    onConfirm(date);
  };

  const handleKeyDown =
    (previousField?: Field) =>
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleConfirm();
        return;
      }
      // 빈 칸에서 지우면 앞 칸으로
      if (
        event.key === "Backspace" &&
        previousField &&
        event.currentTarget.value === ""
      ) {
        event.preventDefault();
        focusField(previousField);
      }
    };

  // 이미 값이 있는 칸을 누르면 전체 선택해, 바로 새로 칠 수 있게 함
  const selectAll = (event: React.FocusEvent<HTMLInputElement>) =>
    event.currentTarget.select();

  const fieldProps = {
    type: "text",
    // 월·일을 끊어 칠 수 있도록 . 키가 있는 숫자 키패드
    inputMode: "decimal",
    autoComplete: "off",
    "aria-invalid": !!error,
    onFocus: selectAll,
  } as const;
  const fieldClass = cn(FIELD_CLASS, error && "ring-error focus:ring-error");

  return (
    // 시트 내용 영역이 스크롤 영역이라 칸 바깥으로 그려지는 포커스 테두리가 잘리지 않도록 여백
    <div className="mx-auto flex w-full max-w-sm flex-col gap-3 p-1">
      <div className="flex flex-col gap-1">
        <div
          role="group"
          aria-label={label}
          className="flex items-center gap-2 text-base"
        >
          <input
            {...fieldProps}
            ref={fieldRefs.year}
            // 시트가 열리며 바로 키패드가 올라오도록
            autoFocus
            aria-label="년"
            placeholder="YYYY"
            value={year}
            onChange={(event) => handleYearChange(event.target.value)}
            onKeyDown={handleKeyDown()}
            className={cn(fieldClass, "flex-[4]")}
          />
          <span>년</span>
          <input
            {...fieldProps}
            ref={fieldRefs.month}
            aria-label="월"
            placeholder="MM"
            value={month}
            onChange={(event) => handleMonthChange(event.target.value)}
            onKeyDown={handleKeyDown("year")}
            className={cn(fieldClass, "flex-[3]")}
          />
          <span>월</span>
          <input
            {...fieldProps}
            ref={fieldRefs.day}
            aria-label="일"
            placeholder="DD"
            value={day}
            onChange={(event) => handleDayChange(event.target.value)}
            onKeyDown={handleKeyDown("month")}
            className={cn(fieldClass, "flex-[3]")}
          />
          <span>일</span>
        </div>
        {error && <p className="text-error text-start text-sm">{error}</p>}
      </div>
      <Button
        size="lg"
        full
        onClick={handleConfirm}
        disabled={!canConfirm}
        className="disabled:opacity-40"
      >
        확인
      </Button>
    </div>
  );
}

export default DirectDateInput;
