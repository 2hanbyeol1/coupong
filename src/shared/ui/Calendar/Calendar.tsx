"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/shared/lib/util/cn";
import { parseDateInputValue, toDateInputValue } from "@/shared/lib/util/date";

interface CalendarProps {
  /** 선택된 날짜 (YYYY-MM-DD) */
  value?: string;
  /** 고를 수 있는 가장 이른 날짜 (YYYY-MM-DD) */
  min?: string;
  onSelect: (value: string) => void;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const getMonthStart = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

/** 한 달씩 넘겨 보며 날짜를 고르는 달력 */
function Calendar({ value = "", min, onSelect }: CalendarProps) {
  const minDate = min ? parseDateInputValue(min) : null;
  // 선택된 날짜가 있으면 그 달, 없으면 고를 수 있는 첫 달(또는 이번 달)부터 표시
  const [viewMonth, setViewMonth] = useState(() =>
    getMonthStart(parseDateInputValue(value) ?? minDate ?? new Date()),
  );

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const today = toDateInputValue(new Date());
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  const canGoPrev = !minDate || viewMonth > getMonthStart(minDate);
  const moveMonth = (offset: number) =>
    setViewMonth(new Date(year, month + offset, 1));

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => moveMonth(-1)}
          disabled={!canGoPrev}
          aria-label="이전 달"
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full disabled:cursor-default disabled:opacity-30"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-base font-semibold" aria-live="polite">
          {year}년 {month + 1}월
        </span>
        <button
          type="button"
          onClick={() => moveMonth(1)}
          aria-label="다음 달"
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAYS.map((weekday, index) => (
          <span
            key={weekday}
            className={cn(
              "py-1 text-xs",
              index === 0 ? "text-error" : "text-dark",
            )}
          >
            {weekday}
          </span>
        ))}

        {cells.map((day, index) => {
          if (day === null) return <span key={`empty-${index}`} />;

          const date = toDateInputValue(new Date(year, month, day));
          const isSelected = date === value;
          const isToday = date === today;
          // YYYY-MM-DD는 문자열 비교로 날짜 순서를 비교할 수 있음
          const isDisabled = !!min && date < min;

          return (
            <div key={date} className="flex justify-center">
              <button
                type="button"
                onClick={() => onSelect(date)}
                disabled={isDisabled}
                aria-pressed={isSelected}
                aria-label={`${year}년 ${month + 1}월 ${day}일`}
                className={cn(
                  "flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-base transition-colors",
                  isSelected
                    ? "bg-primary font-semibold text-white"
                    : isToday
                      ? "text-primary font-semibold"
                      : "hover:bg-light",
                  isDisabled &&
                    "cursor-default text-black/20 hover:bg-transparent",
                )}
              >
                {day}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;
