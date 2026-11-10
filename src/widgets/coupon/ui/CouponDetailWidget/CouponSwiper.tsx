"use client";
import { Ref, useImperativeHandle, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  animate,
  motion,
  PanInfo,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";

import { CouponType } from "@/entities/coupon/api/type";
import { CouponImage } from "@/entities/coupon/ui/CouponImage";
import { cn } from "@/shared/lib/util/cn";

type CouponSlide = Pick<CouponType, "id" | "name" | "image_path">;

/** 1: 다음 쿠폰, -1: 이전 쿠폰 */
export type SlideDirection = 1 | -1;

export interface CouponSwiperHandle {
  slideTo: (direction: SlideDirection) => Promise<void>;
}

interface CouponSwiperProps {
  ref?: Ref<CouponSwiperHandle>;
  prev?: CouponSlide;
  current: CouponSlide;
  next?: CouponSlide;
  imageClassName?: string;
  disabled?: boolean;
  onChange: (couponId: CouponType["id"]) => void;
}

const SWIPE_DISTANCE_RATIO = 0.2; // 너비의 20% 이상 끌면 넘김
const SWIPE_VELOCITY = 500; // px/s 이상으로 빠르게 쓸면 넘김
const EDGE_ELASTIC = 0.2; // 양 끝에서 고무줄처럼 덜 끌리는 정도
const SLIDE_TRANSITION = {
  type: "tween",
  ease: [0.2, 0.8, 0.2, 1],
  duration: 0.3,
} as const;

function CouponSwiper({
  ref,
  prev,
  current,
  next,
  imageClassName,
  disabled,
  onChange,
}: CouponSwiperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isSlidingRef = useRef(false);
  const [isSliding, setIsSliding] = useState(false);
  const x = useMotionValue(0);
  const shouldReduceMotion = useReducedMotion();
  const transition = shouldReduceMotion ? { duration: 0 } : SLIDE_TRANSITION;

  const slideTo = async (direction: SlideDirection) => {
    const target = direction === 1 ? next : prev;
    if (!target || isSlidingRef.current) return;

    isSlidingRef.current = true;
    setIsSliding(true);

    const width = containerRef.current?.offsetWidth ?? 0;
    await animate(x, -direction * width, transition);

    // 새 쿠폰 기준으로 슬라이드를 다시 그린 직후 위치를 되돌려야 깜빡이지 않는다.
    flushSync(() => onChange(target.id));
    x.set(0);

    isSlidingRef.current = false;
    setIsSliding(false);
  };

  useImperativeHandle(ref, () => ({ slideTo }));

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    { offset, velocity }: PanInfo,
  ) => {
    const width = containerRef.current?.offsetWidth ?? 0;
    const direction: SlideDirection = offset.x < 0 ? 1 : -1;
    const isFlickBack =
      Math.sign(velocity.x) === -Math.sign(offset.x) &&
      Math.abs(velocity.x) > SWIPE_VELOCITY;
    const isSwipe =
      !isFlickBack &&
      (Math.abs(offset.x) > width * SWIPE_DISTANCE_RATIO ||
        Math.abs(velocity.x) > SWIPE_VELOCITY);
    const target = direction === 1 ? next : prev;

    if (isSwipe && target) {
      slideTo(direction);
      return;
    }
    animate(x, 0, transition);
  };

  const isDraggable = !disabled && !isSliding;
  const slides = [
    { coupon: prev, position: -1 },
    { coupon: current, position: 0 },
    { coupon: next, position: 1 },
  ];

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      <motion.div
        className={cn(
          "relative h-full w-full select-none [&_img]:pointer-events-none",
          isDraggable && "cursor-grab active:cursor-grabbing",
        )}
        style={{ x }}
        drag={isDraggable ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{
          left: next ? 1 : EDGE_ELASTIC,
          right: prev ? 1 : EDGE_ELASTIC,
        }}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
      >
        {slides.map(
          ({ coupon, position }) =>
            coupon && (
              <div
                key={coupon.id}
                className="absolute top-0 h-full w-full"
                style={{ left: `${position * 100}%` }}
                aria-hidden={position !== 0}
              >
                <CouponImage
                  imagePath={coupon.image_path}
                  couponName={coupon.name}
                  imageClassName={imageClassName}
                  sizes="100vw"
                />
              </div>
            ),
        )}
      </motion.div>
    </div>
  );
}

export default CouponSwiper;
