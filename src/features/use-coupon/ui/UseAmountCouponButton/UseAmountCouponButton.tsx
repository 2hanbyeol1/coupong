"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { spendAmountCouponOption } from "@/entities/coupon/api/query";
import { CouponType, CouponUsageType } from "@/entities/coupon/api/type";
import {
  FACE_VALUE_MAX_DIGITS,
  getRemainingAmount,
  SPEND_QUICK_ADD_AMOUNTS,
} from "@/entities/coupon/lib/amount";
import useToast from "@/shared/lib/hook/useToast";
import { cn } from "@/shared/lib/util/cn";
import { formatWon } from "@/shared/lib/util/money";
import { AmountInput, BottomSheet, Button } from "@/shared/ui";

/** 금액권을 쓴 결과 (되돌리기·다음 쿠폰으로 넘길지 정할 때 씀) */
export interface AmountCouponUsage {
  usageId: CouponUsageType["id"];
  amount: number;
  /** 쓰고 난 뒤 남은 금액 (0이면 사용 완료) */
  remaining: number;
}

export interface UseAmountCouponButtonProps {
  className?: string;
  coupon: CouponType;
  onUsed?: (usage: AmountCouponUsage) => void;
}

/** 금액권 사용 버튼: 누르면 이번에 쓴 금액을 입력하는 시트가 열림 */
function UseAmountCouponButton({
  className,
  coupon,
  onUsed,
}: UseAmountCouponButtonProps) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [amountDigits, setAmountDigits] = useState("");

  const remaining = getRemainingAmount(coupon);
  const amount = Number(amountDigits || 0);
  const isOverRemaining = amount > remaining;
  const remainingAfter = Math.max(0, remaining - amount);

  const { mutate: spendAmountCoupon, isPending } = useMutation(
    spendAmountCouponOption(queryClient),
  );

  const open = () => {
    setAmountDigits("");
    setIsOpen(true);
  };

  const close = () => {
    if (!isPending) setIsOpen(false);
  };

  const spend = (spentAmount: number) => {
    if (spentAmount < 1 || spentAmount > remaining || isPending) return;
    spendAmountCoupon(
      { couponId: coupon.id, amount: spentAmount },
      {
        onSuccess: (usageId) => {
          setIsOpen(false);
          onUsed?.({
            usageId,
            amount: spentAmount,
            remaining: remaining - spentAmount,
          });
        },
        // 그사이 다른 그룹원이 써서 남은 금액이 모자란 경우처럼 이유를 알려줌
        onError: (error) => addToast({ message: error.message }),
      },
    );
  };

  const footer = (
    <div className="flex gap-2">
      <Button
        color="light"
        size="lg"
        className="flex-1"
        disabled={isPending}
        onClick={() => spend(remaining)}
      >
        전액 사용
      </Button>
      <Button
        size="lg"
        className="flex-[2]"
        disabled={isPending || amount < 1 || isOverRemaining}
        onClick={() => spend(amount)}
      >
        사용하기
      </Button>
    </div>
  );

  return (
    <>
      <Button className={className} size="lg" onClick={open}>
        사용하기
      </Button>

      <BottomSheet
        open={isOpen}
        onClose={close}
        dismissible={!isPending}
        title={coupon.name}
        footer={footer}
      >
        <form
          className="flex flex-col gap-5 pb-1"
          onSubmit={(event) => {
            event.preventDefault();
            if (!isOverRemaining) spend(amount);
          }}
        >
          <div className="flex items-baseline justify-between">
            <span className="text-dark text-sm">남은 금액</span>
            <span className="text-lg font-semibold tabular-nums">
              {formatWon(remaining)}
            </span>
          </div>

          <AmountInput
            label="이번에 쓴 금액"
            autoFocus
            enterKeyHint="done"
            maxDigits={FACE_VALUE_MAX_DIGITS}
            value={amountDigits}
            onChange={setAmountDigits}
            errorMessage={
              isOverRemaining ? "남은 금액보다 많이 쓸 수 없어요" : undefined
            }
            // 더하면 남은 금액을 넘는 버튼은 막음
            quickAddAmounts={SPEND_QUICK_ADD_AMOUNTS}
            maxAmount={remaining}
          />

          <div className="flex items-baseline justify-between text-sm">
            <span className="text-dark">사용 후 잔액</span>
            <span
              className={cn(
                "font-semibold tabular-nums",
                isOverRemaining && "text-dark line-through",
              )}
            >
              {formatWon(remainingAfter)}
            </span>
          </div>
        </form>
      </BottomSheet>
    </>
  );
}

export default UseAmountCouponButton;
