"use client";
import { useEffect, useRef, useState } from "react";
import {
  animate,
  AnimationPlaybackControls,
  motion,
  PanInfo,
  useMotionValue,
} from "framer-motion";
import Image from "next/image";

import { COUPON_IMAGE_ASPECT_CLASS } from "@/entities/coupon/constants";
import { cn } from "@/shared/lib/util/cn";

interface CouponImageCarouselProps {
  imagePreviews: string[];
  currentIndex: number;
  /** 사진을 누르거나 밀어서 고른 쿠폰 */
  onSelect: (index: number) => void;
}

/** 쿠폰 사진 비율 (9:16) */
const IMAGE_RATIO = 9 / 16;
/** 사진 사이 간격 (gap-3) */
const GAP = 12;
/** 이만큼(px) 넘게 밀면 적어도 한 칸은 이동 */
const SWIPE_THRESHOLD = 50;
/** 손을 뗄 때의 속도로 이만큼(초) 더 미끄러진다고 보고 몇 칸 갈지 정함 */
const SWIPE_VELOCITY_PROJECTION = 0.2;
const SLIDE_SPRING = { type: "spring", stiffness: 320, damping: 34 } as const;

/**
 * 쿠폰 사진을 한 줄로 이어 붙이고, 지금 쿠폰을 가운데에 둔 캐러셀
 * 옆 사진이 그대로 가운데로 미끄러져 들어오고, 밀거나 사진을 눌러 이동
 * 길게·빠르게 밀거나 멀리 있는 사진을 누르면 여러 칸을 한 번에 이동
 */
function CouponImageCarousel({
  imagePreviews,
  currentIndex,
  onSelect,
}: CouponImageCarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null,
  );
  const x = useMotionValue(0);
  // 진행 중인 이동 애니메이션은 하나만 두고, 새로 움직이기 전에 항상 멈춤
  // (멈추지 않으면 예전 위치로 가던 애니메이션이 끝까지 진행돼 가운데에서 어긋남)
  const slideControlsRef = useRef<AnimationPlaybackControls | null>(null);
  const prevIndexRef = useRef<number | null>(null);
  // 밀어서 넘긴 뒤 손을 뗀 위치의 사진이 눌린 것으로 처리되지 않도록
  const isSwipingRef = useRef(false);
  // 끄는 중일 때 손을 떼면 갈 쿠폰 (끌지 않을 때는 null)
  const [swipeTargetIndex, setSwipeTargetIndex] = useState<number | null>(null);
  const activeIndex = swipeTargetIndex ?? currentIndex;

  const hasMultiple = imagePreviews.length > 1;
  const itemWidth = size ? size.height * IMAGE_RATIO : 0;
  // 지금 쿠폰의 가운데가 화면 가운데에 오는 위치
  const targetX = size
    ? size.width / 2 - (currentIndex * (itemWidth + GAP) + itemWidth / 2)
    : 0;

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  const slideTo = (target: number, { animated }: { animated: boolean }) => {
    slideControlsRef.current?.stop();
    slideControlsRef.current = null;
    if (animated) {
      const controls = animate(x, target, {
        ...SLIDE_SPRING,
        onComplete: () => {
          if (slideControlsRef.current === controls) {
            slideControlsRef.current = null;
          }
        },
      });
      slideControlsRef.current = controls;
    } else {
      x.set(target);
    }
  };
  const slideToRef = useRef(slideTo);
  slideToRef.current = slideTo;

  // 쿠폰이 바뀌면 미끄러지듯 이동, 화면 크기만 바뀌면(추천 칩·키보드 등) 바로 맞춤
  useEffect(() => {
    if (!size) return;
    const isIndexChanged =
      prevIndexRef.current !== null && prevIndexRef.current !== currentIndex;
    prevIndexRef.current = currentIndex;
    // 넘어가는 중에 크기가 바뀌면 끊지 않고 새 위치로 이어서 미끄러짐
    const isSliding = slideControlsRef.current !== null;
    slideToRef.current(targetX, { animated: isIndexChanged || isSliding });
  }, [currentIndex, size, targetX]);

  useEffect(() => () => slideControlsRef.current?.stop(), []);

  /** 민 거리와 속도로 보아, 지금 손을 떼면 가게 될 쿠폰 */
  const getSwipeTargetIndex = (info: PanInfo) => {
    const step = itemWidth + GAP;
    const projected =
      info.offset.x + info.velocity.x * SWIPE_VELOCITY_PROJECTION;
    let moveBy = -Math.round(projected / step);
    if (moveBy === 0 && Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
      moveBy = info.offset.x < 0 ? 1 : -1;
    }
    return Math.min(
      imagePreviews.length - 1,
      Math.max(0, currentIndex + moveBy),
    );
  };

  // 끄는 동안 손을 떼면 활성화될 사진을 미리 선명하게 표시
  const handleDrag = (_: unknown, info: PanInfo) => {
    const targetIndex = getSwipeTargetIndex(info);
    setSwipeTargetIndex((prev) => (prev === targetIndex ? prev : targetIndex));
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    setSwipeTargetIndex(null);
    // 일단 제자리로 돌아가고, 쿠폰이 바뀌면 위 효과가 새 위치로 이어서 이동
    slideTo(targetX, { animated: true });
    const nextIndex = getSwipeTargetIndex(info);
    if (nextIndex !== currentIndex) onSelect(nextIndex);
    // 끌기가 끝난 직후 발생하는 클릭까지 무시한 뒤 해제
    setTimeout(() => {
      isSwipingRef.current = false;
    });
  };

  const handleImageClick = (index: number) => {
    if (isSwipingRef.current) return;
    onSelect(index);
  };

  return (
    <div
      ref={viewportRef}
      // 남는 공간을 채우되, 입력칸이 늘어나도 240px보다 작아지지 않음 (넘치면 바깥이 스크롤)
      className="-mx-4 min-h-60 flex-1 overflow-hidden"
      // 크기를 재기 전에는 위치가 맞지 않으므로 숨김
      style={{ visibility: size ? "visible" : "hidden" }}
    >
      <motion.div
        drag={hasMultiple ? "x" : false}
        dragMomentum={false}
        onDragStart={() => {
          isSwipingRef.current = true;
        }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="flex h-full w-max touch-pan-y gap-3"
      >
        {imagePreviews.map((url, index) => {
          const isCurrent = index === currentIndex;
          const itemClass = cn(
            "relative h-full shrink-0 transition-opacity duration-300",
            COUPON_IMAGE_ASPECT_CLASS,
            // 끄는 동안에는 손을 떼면 갈 사진이 선명해짐
            index !== activeIndex && "opacity-30",
          );
          const image = (
            <Image
              src={url}
              alt={isCurrent ? `쿠폰 이미지 ${index + 1}` : ""}
              fill
              draggable={false}
              className="object-contain"
            />
          );

          // 지금 쿠폰이 아닌 사진은 눌러서 그 쿠폰으로 이동
          if (!isCurrent) {
            return (
              <button
                key={url}
                type="button"
                onClick={() => handleImageClick(index)}
                aria-label={`${index + 1}번째 쿠폰으로 이동`}
                className={cn(
                  itemClass,
                  "cursor-pointer",
                  // 흐린 사진에만 마우스를 올렸을 때 조금 진하게
                  index !== activeIndex && "hover:opacity-50",
                )}
              >
                {image}
              </button>
            );
          }
          return (
            <div key={url} aria-hidden={!isCurrent} className={itemClass}>
              {image}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

export default CouponImageCarousel;
