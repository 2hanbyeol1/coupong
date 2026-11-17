"use client";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteCouponUsageOption,
  getCouponUsagesOption,
} from "@/entities/coupon/api/query";
import { CouponType } from "@/entities/coupon/api/type";
import { getMyInfoOption } from "@/entities/user/api/query";
import { Avatar } from "@/entities/user/ui/Avatar";
import useModal from "@/shared/lib/hook/useModal";
import useToast from "@/shared/lib/hook/useToast";
import { cn } from "@/shared/lib/util/cn";
import { formatShortDate } from "@/shared/lib/util/date";
import { formatWon } from "@/shared/lib/util/money";
import Skeleton from "@/shared/ui/Skeleton";

interface CouponUsageHistoryProps {
  couponId: CouponType["id"];
  /** 영수증처럼 내역 맨 아래에 보여줄 남은 금액 */
  remaining: number;
}

/** "11월 17일 14:03" */
const formatUsedAt = (value: string) => {
  const date = new Date(value);
  const time = date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  return `${formatShortDate(value)} ${time}`;
};

/**
 * 금액권 사용 내역 (최근에 쓴 순), 내가 남긴 기록은 지울 수 있음
 * 맨 아래에 영수증처럼 남은 금액
 */
function CouponUsageHistory({ couponId, remaining }: CouponUsageHistoryProps) {
  const queryClient = useQueryClient();
  const { showModal, hideModal, updateModal } = useModal();
  const { addToast } = useToast();
  const { data: me } = useQuery(getMyInfoOption());
  const { data: usages, isPending: isLoading } = useQuery(
    getCouponUsagesOption(couponId),
  );

  const { mutate: deleteUsage, isPending: isDeleting } = useMutation(
    deleteCouponUsageOption(queryClient, {
      onSuccess: () => {
        hideModal();
        addToast({ message: "사용 기록을 지웠어요" });
      },
      onError: (error) => {
        hideModal();
        addToast({ message: error.message });
      },
    }),
  );

  useEffect(() => {
    if (!isDeleting) return;
    updateModal({ confirmButtonDisabled: true });
    return () => updateModal({ confirmButtonDisabled: false });
  }, [isDeleting, updateModal]);

  const openDeleteModal = (usageId: string, amount: number) => {
    showModal({
      title: "사용 기록을 지울까요?",
      content: `지우면 ${formatWon(amount)}이 다시 남은 금액에 더해져요.`,
      confirmButtonText: "지우기",
      onConfirm: () => deleteUsage(usageId),
    });
  };

  return (
    <section aria-label="사용 내역" className="flex flex-col gap-2">
      <h3 className="text-base font-semibold">사용 내역</h3>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ) : !usages?.length ? (
        <p className="text-dark py-2 text-sm">아직 사용한 내역이 없어요</p>
      ) : (
        <ul className="flex flex-col">
          {usages.map((usage, index) => {
            const isMine = !!me && usage.user_id === me.user_id;
            return (
              <li
                key={usage.id}
                className={cn(
                  "flex items-center gap-2.5 py-2.5",
                  index > 0 && "border-light border-t",
                )}
              >
                {usage.user_id ? (
                  <Avatar userId={usage.user_id} size={24} />
                ) : (
                  <span className="bg-light h-6 w-6 shrink-0 rounded-full" />
                )}
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">
                    {usage.user?.name ?? "알 수 없음"}
                  </span>
                  {/* 지우기는 날짜 옆 작은 글자로 (금액 줄 오른쪽 끝을 비우지 않게) */}
                  <span className="text-dark flex items-center gap-1 text-xs">
                    {formatUsedAt(usage.created_at)}
                    {isMine && (
                      <>
                        <span aria-hidden>·</span>
                        <button
                          type="button"
                          onClick={() =>
                            openDeleteModal(usage.id, usage.amount)
                          }
                          aria-label={`${formatWon(usage.amount)} 사용 기록 지우기`}
                          // 글자는 작아도 누르기 쉽게 누르는 범위만 넓힘
                          className="hover:text-error -m-2 cursor-pointer p-2 underline underline-offset-2 transition-colors"
                        >
                          지우기
                        </button>
                      </>
                    )}
                  </span>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums">
                  -{formatWon(usage.amount)}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {/* 영수증의 합계처럼 선 아래 남은 금액 (금액은 내역의 금액과 같이 오른쪽 끝) */}
      <div className="border-ink/20 mt-1 flex items-center gap-2.5 border-t pt-3.5">
        <span className="text-dark flex-1 text-sm">남은 금액</span>
        <span className="shrink-0 text-lg font-bold tabular-nums">
          {formatWon(remaining)}
        </span>
      </div>
    </section>
  );
}

export default CouponUsageHistory;
