"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Maximize2, Minimize2 } from "lucide-react";
import {
  notFound,
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  cancelCouponUseOption,
  getCouponDetailOption,
} from "@/entities/coupon/api/query";
import { CouponType } from "@/entities/coupon/api/type";
import { COUPON_USE_UNDO_DURATION } from "@/entities/coupon/constants";
import { getCouponListStatus } from "@/entities/coupon/lib/status";
import { ROUTES } from "@/shared/config/routes";
import useToast from "@/shared/lib/hook/useToast";
import useWakeLock from "@/shared/lib/hook/useWakeLock";

import CouponDetailPanel from "./CouponDetailPanel";
import { CouponDetailPanelSkeleton } from "./CouponDetailWidgetSkeleton";
import CouponSwiper, {
  CouponSwiperHandle,
  SlideDirection,
} from "./CouponSwiper";
import useCouponSequence from "./useCouponSequence";

// 사용 처리 결과를 잠깐 보여준 뒤 다음 쿠폰으로 넘어가기까지의 시간
const AUTO_SLIDE_DELAY_AFTER_USE = 700; // ms

interface PendingSlide {
  direction: SlideDirection;
  target: CouponType;
  delay: number;
  /** 삭제된 쿠폰: 넘어간 뒤 스와이프 순서에서 제외 */
  removedId?: CouponType["id"];
}

function CouponDetailWidget() {
  const { couponId } = useParams<{ couponId: string }>();
  const keyword = useSearchParams().get("keyword") ?? undefined;
  // 스와이프로 URL이 바뀌어도 처음 진입한 쿠폰을 기준으로 유지
  const [initialCouponId] = useState(couponId);

  const { data: initialCoupon } = useSuspenseQuery(
    getCouponDetailOption(initialCouponId),
  );
  if (!initialCoupon) notFound();

  return <CouponDetail initialCoupon={initialCoupon} keyword={keyword} />;
}

interface CouponDetailProps {
  initialCoupon: CouponType;
  keyword?: string;
}

function CouponDetail({ initialCoupon, keyword }: CouponDetailProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const swiperRef = useRef<CouponSwiperHandle>(null);
  // 매장에서 바코드를 보여주는 동안 화면이 어두워지지 않게
  useWakeLock();

  const [currentId, setCurrentId] = useState(initialCoupon.id);
  const [isExpanded, setIsExpanded] = useState(false);
  const [excludedIds, setExcludedIds] = useState<CouponType["id"][]>([]);
  const [pendingSlide, setPendingSlide] = useState<PendingSlide | null>(null);
  // 처음 들어온 쿠폰이 속한 탭(사용 가능 / 지난 쿠폰) 안에서만 넘겨 봄
  // (사용 처리로 쿠폰 상태가 바뀌어도 탭은 그대로 유지)
  const [listStatus] = useState(() => getCouponListStatus(initialCoupon));

  const { current, prev, next } = useCouponSequence({
    organizationId: initialCoupon.organization_id,
    currentId,
    status: listStatus,
    keyword,
    excludedIds,
  });
  // 목록에서 아직 찾지 못했거나(직접 진입) 목록에서 빠진 경우 상세 데이터로 표시
  const { data: currentDetail } = useQuery(getCouponDetailOption(currentId));
  const currentSlide = current ?? currentDetail;

  // 토스트 버튼처럼 나중에 실행되는 콜백에서 지금 보고 있는 쿠폰을 알 수 있게 함
  const currentIdRef = useRef(currentId);
  useEffect(() => {
    currentIdRef.current = currentId;
  }, [currentId]);

  // 자동으로 넘어갈 대상은 목록이 다시 정렬돼도 바뀌지 않도록 고정
  const slidePrev = pendingSlide?.direction === -1 ? pendingSlide.target : prev;
  const slideNext = pendingSlide?.direction === 1 ? pendingSlide.target : next;

  // 넘겼을 때 하단 정보가 바로 보이도록 이웃 쿠폰 상세를 미리 불러옴
  useEffect(() => {
    [prev?.id, next?.id].forEach((id) => {
      if (id) queryClient.prefetchQuery(getCouponDetailOption(id));
    });
  }, [prev?.id, next?.id, queryClient]);

  useEffect(() => {
    if (!pendingSlide) return;

    const timer = setTimeout(
      () => swiperRef.current?.slideTo(pendingSlide.direction),
      pendingSlide.delay,
    );
    return () => clearTimeout(timer);
  }, [pendingSlide]);

  const handleChange = (id: CouponType["id"]) => {
    const removedId = pendingSlide?.removedId;
    if (removedId) setExcludedIds((ids) => [...ids, removedId]);

    setPendingSlide(null);
    setCurrentId(id);
    setIsExpanded(false);
    window.history.replaceState(null, "", ROUTES.COUPON_DETAIL(id, keyword));
  };

  const { mutate: cancelCouponUse } = useMutation(
    cancelCouponUseOption(queryClient, {
      onSuccess: () => addToast({ message: "쿠폰 사용을 되돌렸어요" }),
      onError: (error) => addToast({ message: error.message }),
    }),
  );

  /** 되돌린 쿠폰으로 다시 이동 (다음 쿠폰으로 넘어갔다면 되돌린 쿠폰 쪽으로 넘김) */
  const returnToRestoredCoupon = (restored: CouponType) => {
    // 아직 넘어가기 전이면 넘어가지 않고 그대로 머묾
    if (currentIdRef.current === restored.id) {
      setPendingSlide(null);
      return;
    }
    setPendingSlide({ direction: -1, target: restored, delay: 0 });
  };

  const handleUsed = () => {
    const usedCoupon = currentSlide;
    // 잘못 눌렀을 때를 위해 잠시 동안 되돌릴 수 있게 함
    addToast({
      message: "쿠폰을 사용했어요",
      duration: COUPON_USE_UNDO_DURATION,
      action: {
        label: "되돌리기",
        onClick: () => {
          if (!usedCoupon) return;
          // 상세 화면을 벗어났으면 이 콜백은 실행되지 않고 안내 토스트만 뜸
          cancelCouponUse(usedCoupon.id, {
            onSuccess: () => returnToRestoredCoupon(usedCoupon),
          });
        },
      },
    });
    // next는 사용 버튼을 누른 시점(재정렬 전)의 다음 쿠폰
    if (next)
      setPendingSlide({
        direction: 1,
        target: next,
        delay: AUTO_SLIDE_DELAY_AFTER_USE,
      });
  };

  const handleDeleted = () => {
    const target = next ?? prev;
    if (!target) {
      addToast({ message: "더 볼 수 있는 쿠폰이 없어 홈으로 이동했어요" });
      router.replace(ROUTES.HOME);
      return;
    }

    setPendingSlide({
      direction: next ? 1 : -1,
      target,
      delay: 0,
      removedId: currentId,
    });
  };

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <>
      <div className="relative w-full flex-grow">
        {currentSlide && (
          <CouponSwiper
            ref={swiperRef}
            prev={slidePrev}
            current={currentSlide}
            next={slideNext}
            imageClassName={isExpanded ? "object-cover" : "object-contain"}
            disabled={!!pendingSlide}
            onChange={handleChange}
          />
        )}
        <button
          type="button"
          aria-label={
            isExpanded ? "쿠폰 사진 작게 보기" : "쿠폰 사진 크게 보기"
          }
          className="bg-elevated absolute right-4 bottom-2 z-10 rounded-full p-2 shadow-lg"
          onClick={toggleExpanded}
        >
          {isExpanded ? (
            <Minimize2 className="stroke-dark size-6" />
          ) : (
            <Maximize2 className="stroke-dark size-6" />
          )}
        </button>
      </div>
      <Suspense fallback={<CouponDetailPanelSkeleton />}>
        <CouponDetailPanel
          key={currentId}
          couponId={currentId}
          onUsed={handleUsed}
          onDeleted={handleDeleted}
        />
      </Suspense>
    </>
  );
}

export default CouponDetailWidget;
