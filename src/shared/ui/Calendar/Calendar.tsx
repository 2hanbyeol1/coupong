"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/shared/lib/util/cn";
import { parseDateInputValue, toDateInputValue } from "@/shared/lib/util/date";

interface CalendarProps {
  /** 선택된 날짜 (YYYY-MM-DD) */
  value?: string;
  /** 고를 수 있는 가장 이른 날짜 (YYYY-MM-DD) */
  min?: string;
  onSelect: (value: string) => void;
}

/** day: 날짜 고르기, year·month: 년도·월을 따로 골라 멀리 있는 달로 바로 이동 */
type CalendarView = "day" | "year" | "month";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
/** 고를 수 있는 첫 해부터 몇 년치까지 고를 수 있는지 (3열 × 10줄) */
const YEAR_OPTION_COUNT = 30;

const getMonthStart = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

/** 한 달씩 넘기거나, 년도·월을 따로 골라 이동하며 날짜를 고르는 달력 */
function Calendar({ value = "", min, onSelect }: CalendarProps) {
  const minDate = min ? parseDateInputValue(min) : null;
  const minMonth = minDate ? getMonthStart(minDate) : null;
  // 선택된 날짜가 있으면 그 달, 없으면 고를 수 있는 첫 달(또는 이번 달)부터 표시
  const [viewMonth, setViewMonth] = useState(() =>
    getMonthStart(parseDateInputValue(value) ?? minDate ?? new Date()),
  );
  const [view, setView] = useState<CalendarView>("day");

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const today = toDateInputValue(new Date());
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  // 고를 수 있는 첫 해(min 또는 올해)부터 30년치 (보고 있는 해가 더 이르면 그 해부터)
  const baseYear = minDate?.getFullYear() ?? new Date().getFullYear();
  const lastYearOption = baseYear + YEAR_OPTION_COUNT - 1;
  const firstYearOption = Math.min(baseYear, year);
  const yearOptions = Array.from(
    { length: lastYearOption - firstYearOption + 1 },
    (_, index) => firstYearOption + index,
  );

  const isBeforeMin = (date: Date) => !!minMonth && date < minMonth;
  const canGoPrev = !minMonth || viewMonth > minMonth;
  const canGoNext = year < lastYearOption || month < 11;

  const moveMonth = (offset: number) =>
    setViewMonth(new Date(year, month + offset, 1));

  // 년도 → 월 순서로 고르고, 고르는 중에 다시 누르면 날짜 달력으로 돌아감
  const togglePicker = () =>
    setView((prev) => (prev === "day" ? "year" : "day"));

  const handleYearSelect = (selectedYear: number) => {
    const next = new Date(selectedYear, month, 1);
    // 같은 월이 고를 수 없는 달이면 고를 수 있는 첫 달로
    setViewMonth(minMonth && next < minMonth ? minMonth : next);
    setView("month");
  };

  const handleMonthSelect = (selectedMonth: number) => {
    setViewMonth(new Date(year, selectedMonth, 1));
    setView("day");
  };

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => moveMonth(-1)}
          disabled={!canGoPrev}
          aria-label="이전 달"
          className={cn(
            "flex h-10 w-10 cursor-pointer items-center justify-center rounded-full disabled:cursor-default disabled:opacity-30",
            view !== "day" && "invisible",
          )}
        >
          <ChevronLeft size={20} />
        </button>
        <HeaderButton
          isActive={view !== "day"}
          onClick={togglePicker}
          ariaLabel={`${year}년 ${month + 1}월, 년도와 월 고르기`}
        >
          {year}년 {month + 1}월
        </HeaderButton>
        <button
          type="button"
          onClick={() => moveMonth(1)}
          disabled={!canGoNext}
          aria-label="다음 달"
          className={cn(
            "flex h-10 w-10 cursor-pointer items-center justify-center rounded-full disabled:cursor-default disabled:opacity-30",
            view !== "day" && "invisible",
          )}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* 보기를 바꿔도 시트 높이가 출렁이지 않도록 날짜 달력(6주) 높이를 유지 */}
      <div className="min-h-72">
        {view === "year" && (
          <OptionGrid
            options={yearOptions.map((optionYear) => ({
              key: optionYear,
              label: `${optionYear}년`,
              isSelected: optionYear === year,
              isDisabled: isBeforeMin(new Date(optionYear, 11, 1)),
              onClick: () => handleYearSelect(optionYear),
            }))}
            scrollable
          />
        )}

        {view === "month" && (
          <OptionGrid
            options={Array.from({ length: 12 }, (_, optionMonth) => ({
              key: optionMonth,
              label: `${optionMonth + 1}월`,
              isSelected: optionMonth === month,
              isDisabled: isBeforeMin(new Date(year, optionMonth, 1)),
              onClick: () => handleMonthSelect(optionMonth),
            }))}
          />
        )}

        {view === "day" && (
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
        )}
      </div>
    </div>
  );
}

function HeaderButton({
  isActive,
  onClick,
  ariaLabel,
  children,
}: {
  isActive: boolean;
  onClick: () => void;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-expanded={isActive}
      aria-live="polite"
      className={cn(
        "flex h-9 cursor-pointer items-center gap-0.5 rounded-full px-3 text-base font-semibold transition-colors",
        isActive ? "bg-light" : "hover:bg-light",
      )}
    >
      {children}
      <ChevronDown
        size={16}
        className={cn("transition-transform", isActive && "rotate-180")}
        aria-hidden
      />
    </button>
  );
}

interface Option {
  key: number;
  label: string;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

/**
 * 년도·월 목록 (3열)
 * scrollable이면 달력 높이 안에서 스크롤되고, 처음 열 때 고른 항목이 보이도록 스크롤
 */
function OptionGrid({
  options,
  scrollable = false,
}: {
  options: Option[];
  scrollable?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  // 처음 열 때 고른 항목이 가려져 있으면 가운데로 스크롤
  useEffect(() => {
    const container = scrollRef.current;
    const selected = selectedRef.current;
    if (!container || !selected) return;
    container.scrollTop =
      selected.offsetTop - (container.clientHeight - selected.clientHeight) / 2;
  }, []);

  const grid = (
    <div className="grid grid-cols-3 gap-2">
      {options.map(({ key, label, isSelected, isDisabled, onClick }) => (
        <button
          key={key}
          ref={isSelected ? selectedRef : undefined}
          type="button"
          onClick={onClick}
          disabled={isDisabled}
          aria-pressed={isSelected}
          className={cn(
            "flex h-14 cursor-pointer items-center justify-center rounded-full text-base transition-colors",
            isSelected
              ? "bg-primary font-semibold text-white"
              : "hover:bg-light",
            isDisabled && "cursor-default text-black/20 hover:bg-transparent",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );

  if (!scrollable) return grid;

  return (
    // 4줄 반만 보여 아래에 더 있다는 것을 알 수 있게 함
    <div
      ref={scrollRef}
      className="relative h-72 overflow-y-auto overscroll-contain"
    >
      {grid}
    </div>
  );
}

export default Calendar;
