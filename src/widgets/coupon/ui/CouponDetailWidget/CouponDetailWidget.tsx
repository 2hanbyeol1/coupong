"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import {
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

import { getCouponDetailOption } from "@/entities/coupon/api/query";
import { CouponType } from "@/entities/coupon/api/type";
import { ROUTES } from "@/shared/config/routes";
import useToast from "@/shared/lib/hook/useToast";

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

  const [currentId, setCurrentId] = useState(initialCoupon.id);
  const [isExpanded, setIsExpanded] = useState(false);
  const [excludedIds, setExcludedIds] = useState<CouponType["id"][]>([]);
  const [pendingSlide, setPendingSlide] = useState<PendingSlide | null>(null);

  const { current, prev, next } = useCouponSequence({
    organizationId: initialCoupon.organization_id,
    currentId,
    keyword,
    excludedIds,
  });
  // 목록에서 아직 찾지 못했거나(직접 진입) 목록에서 빠진 경우 상세 데이터로 표시
  const { data: currentDetail } = useQuery(getCouponDetailOption(currentId));
  const currentSlide = current ?? currentDetail;

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

  const handleUsed = () => {
    addToast({ message: "쿠폰을 사용했어요" });
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
          className="absolute right-4 bottom-2 z-10 rounded-full bg-white p-2 shadow-lg"
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
