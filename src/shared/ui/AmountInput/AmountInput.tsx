"use client";
import { ComponentProps, forwardRef, useId } from "react";

import { cn } from "@/shared/lib/util/cn";
import {
  formatAmountDigits,
  formatQuickAddLabel,
  formatWon,
  toAmountDigits,
} from "@/shared/lib/util/money";

interface AmountInputProps
  extends Omit<ComponentProps<"input">, "value" | "onChange" | "type"> {
  label: string;
  /** 라벨을 화면에서 숨김 (스크린 리더에는 읽힘) */
  hideLabel?: boolean;
  /** 숫자만 담긴 값 ("12500"), 없으면 빈 문자열 */
  value: string;
  onChange: (digits: string) => void;
  /** 입력할 수 있는 최대 자리 수 */
  maxDigits?: number;
  errorMessage?: string;
  /** 입력칸 아래에 둘, 눌러서 지금 금액에 더하는 버튼의 금액 (보여줄 순서대로) */
  quickAddAmounts?: readonly number[];
  /** 더하면 이 금액을 넘는 버튼은 막음 */
  maxAmount?: number;
}

/**
 * 원 단위 금액 입력칸
 * 숫자 키패드로 입력받고, 입력하는 동안 천 단위 쉼표를 찍음. 값은 숫자만 담긴 문자열로 넘김
 * quickAddAmounts를 주면 입력칸 아래에 +1만·+5천 같은 버튼을 한 줄로 둠 (누를 때마다 더함)
 */
const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  (
    {
      label,
      hideLabel,
      value,
      onChange,
      maxDigits = 8,
      errorMessage,
      quickAddAmounts,
      maxAmount = Infinity,
      required,
      disabled,
      className,
      ...props
    },
    ref,
  ) => {
    const id = useId();

    return (
      <div className={className}>
        <div className="flex flex-col gap-1">
          <label
            htmlFor={id}
            className={cn(
              "text-dark text-start text-sm",
              hideLabel && "sr-only",
            )}
          >
            {label}
            {required && <span className="text-error"> *</span>}
          </label>
          <div className="ring-light focus-within:ring-primary flex items-center rounded-md ring-1 focus-within:ring-2">
            <input
              id={id}
              ref={ref}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={formatAmountDigits(value)}
              onChange={(event) =>
                onChange(toAmountDigits(event.target.value, maxDigits))
              }
              aria-invalid={!!errorMessage}
              disabled={disabled}
              className="text-ink min-w-0 flex-1 bg-transparent py-2 pl-4 text-right tabular-nums outline-none"
              {...props}
            />
            <span aria-hidden className="text-dark shrink-0 pr-4 pl-1.5">
              원
            </span>
          </div>
        </div>
        {errorMessage && (
          <div className="text-error mt-1 text-start">{errorMessage}</div>
        )}
        {!!quickAddAmounts?.length && (
          <div
            className="mt-2 grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${quickAddAmounts.length}, 1fr)`,
            }}
          >
            {quickAddAmounts.map((step) => {
              const next = Number(value || 0) + step;
              return (
                <button
                  key={step}
                  type="button"
                  disabled={disabled || next > maxAmount}
                  // 입력칸 포커스를 뺏지 않아 키패드가 닫히지 않게 함
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => onChange(String(next))}
                  aria-label={`${label}에 ${formatWon(step)} 더하기`}
                  className="bg-light text-ink h-10 cursor-pointer rounded-lg text-sm font-semibold tabular-nums transition-[opacity,transform] duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {formatQuickAddLabel(step)}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  },
);

AmountInput.displayName = "AmountInput";

export default AmountInput;
