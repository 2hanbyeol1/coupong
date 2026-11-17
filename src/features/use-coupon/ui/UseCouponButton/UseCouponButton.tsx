"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { changeCouponToUsedOption } from "@/entities/coupon/api/query";
import { CouponType } from "@/entities/coupon/api/type";
import useToast from "@/shared/lib/hook/useToast";
import { Button } from "@/shared/ui";

export interface UseCouponButtonProps {
  className?: string;
  couponId: CouponType["id"];
  onUsed?: () => void;
}

/**
 * 누르면 바로 사용 완료로 바꿈
 * 잘못 눌러도 바로 뜨는 토스트나 쿠폰 정보의 '사용 취소'로 되돌릴 수 있어 묻지 않음
 */
function UseCouponButton({
  className,
  couponId,
  onUsed,
}: UseCouponButtonProps) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const { mutate: changeCouponToUsed, isPending } = useMutation({
    ...changeCouponToUsedOption(queryClient),
  });

  return (
    <Button
      className={className}
      size="lg"
      disabled={isPending}
      onClick={() =>
        changeCouponToUsed(couponId, {
          onSuccess: () => onUsed?.(),
          // 확인 창이 없으니 실패하면 알려줌
          onError: (error) => addToast({ message: error.message }),
        })
      }
    >
      사용 완료
    </Button>
  );
}

export default UseCouponButton;
