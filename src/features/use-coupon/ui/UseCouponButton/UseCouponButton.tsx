"use client";
import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { changeCouponToUsedOption } from "@/entities/coupon/api/query";
import { CouponType } from "@/entities/coupon/api/type";
import useModal from "@/shared/lib/hook/useModal";
import { Button } from "@/shared/ui";

export interface UseCouponButtonProps {
  className?: string;
  couponId: CouponType["id"];
  onUsed?: () => void;
}

function UseCouponButton({
  className,
  couponId,
  onUsed,
}: UseCouponButtonProps) {
  const queryClient = useQueryClient();
  const { showModal, hideModal, updateModal } = useModal();

  const { mutate: changeCouponToUsed, isPending } = useMutation({
    ...changeCouponToUsedOption(queryClient),
  });

  useEffect(() => {
    updateModal({ confirmButtonDisabled: isPending });
  }, [isPending, updateModal]);

  const handleShowModal = () => {
    showModal({
      title: "쿠폰을 사용하셨나요?",
      content: "한번 사용 버튼을 누르면 되돌릴 수 없어요.",
      onConfirm: () => {
        changeCouponToUsed(couponId, {
          onSuccess: () => onUsed?.(),
          onSettled: () => hideModal(),
        });
      },
    });
  };

  return (
    <Button className={className} size="lg" onClick={handleShowModal}>
      사용 완료
    </Button>
  );
}

export default UseCouponButton;
