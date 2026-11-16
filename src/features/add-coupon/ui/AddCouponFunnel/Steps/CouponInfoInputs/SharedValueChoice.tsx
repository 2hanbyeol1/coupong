"use client";
import { useId, useState } from "react";

import { cn } from "@/shared/lib/util/cn";

export interface SharedValueOption {
  value: string;
  /** 화면에 보여줄 글자 (날짜는 "2027년 8월 18일"처럼) */
  label: string;
  /** 이 값을 입력한 쿠폰 수 */
  count: number;
}

interface SharedValueChoiceProps {
  options: SharedValueOption[];
  defaultValue: string;
  onChange: (value: string) => void;
}

/** 쿠폰마다 입력한 값이 다를 때, 모든 쿠폰에 쓸 값을 하나 고르는 목록 */
function SharedValueChoice({
  options,
  defaultValue,
  onChange,
}: SharedValueChoiceProps) {
  const name = useId();
  const [selected, setSelected] = useState(defaultValue);

  return (
    <div
      role="radiogroup"
      aria-label="모든 쿠폰에 쓸 값"
      className="flex max-h-60 flex-col gap-2 overflow-y-auto text-start"
    >
      {options.map((option) => {
        const isSelected = option.value === selected;
        return (
          <label
            key={option.value}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
              isSelected ? "border-primary bg-primary/5" : "border-light",
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={isSelected}
              onChange={() => {
                setSelected(option.value);
                onChange(option.value);
              }}
              className="accent-primary h-4 w-4 shrink-0"
            />
            <span
              className={cn(
                "text-ink min-w-0 flex-1 truncate",
                isSelected && "font-semibold",
              )}
            >
              {option.label}
            </span>
            <span className="text-dark shrink-0 text-sm">{option.count}개</span>
          </label>
        );
      })}
    </div>
  );
}

export default SharedValueChoice;
