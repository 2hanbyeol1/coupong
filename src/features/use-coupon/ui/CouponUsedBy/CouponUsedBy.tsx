"use client";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cancelCouponUseOption } from "@/entities/coupon/api/query";
import { CouponType } from "@/entities/coupon/api/type";
import { getMyInfoOption } from "@/entities/user/api/query";
import { Avatar } from "@/entities/user/ui/Avatar";
import useModal from "@/shared/lib/hook/useModal";
import useToast from "@/shared/lib/hook/useToast";

interface CouponUsedByProps {
  couponId: CouponType["id"];
  usedBy: string;
  userName?: string;
}

/**
 * 다 쓴 교환권의 사용 내역 (금액권의 사용 내역과 같은 모양)
 * 내가 쓴 쿠폰이면 사용을 취소해 다시 쓸 수 있게 되돌림
 */
function CouponUsedBy({ couponId, usedBy, userName }: CouponUsedByProps) {
  const queryClient = useQueryClient();
  const { showModal, hideModal, updateModal } = useModal();
  const { addToast } = useToast();
  const { data: me } = useQuery(getMyInfoOption());
  const isMine = !!me && me.user_id === usedBy;

  const { mutate: cancelUse, isPending: isCanceling } = useMutation(
    cancelCouponUseOption(queryClient, {
      onSuccess: () => {
        hideModal();
        addToast({ message: "사용을 취소했어요" });
      },
      onError: (error) => {
        hideModal();
        addToast({ message: error.message });
      },
    }),
  );

  useEffect(() => {
    if (!isCanceling) return;
    updateModal({ confirmButtonDisabled: true });
    return () => updateModal({ confirmButtonDisabled: false });
  }, [isCanceling, updateModal]);

  const openCancelModal = () => {
    showModal({
      title: "사용을 취소할까요?",
      content: "취소하면 다시 쓸 수 있는 쿠폰이 돼요.",
      confirmButtonText: "사용 취소",
      onConfirm: () => cancelUse(couponId),
    });
  };

  return (
    <section aria-label="사용 내역" className="flex flex-col gap-2">
      <h3 className="text-base font-semibold">사용 내역</h3>
      <div className="flex items-center gap-2.5 py-2.5">
        <Avatar userId={usedBy} size={24} />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium">
            {userName ?? "알 수 없음"}
          </span>
          {/* 금액권 내역의 '지우기'처럼 이름 아래 작은 글자로 */}
          {isMine && (
            <span className="text-dark text-xs">
              <button
                type="button"
                onClick={openCancelModal}
                // 글자는 작아도 누르기 쉽게 누르는 범위만 넓힘
                className="hover:text-error -m-2 cursor-pointer p-2 underline underline-offset-2 transition-colors"
              >
                사용 취소
              </button>
            </span>
          )}
        </div>
        <span className="shrink-0 text-sm font-semibold">사용 완료</span>
      </div>
    </section>
  );
}

export default CouponUsedBy;
