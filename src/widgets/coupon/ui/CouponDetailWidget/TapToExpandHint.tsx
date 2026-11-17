"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Pointer } from "lucide-react";

// 한 번 보여 줬으면 다시 띄우지 않음
const STORAGE_KEY = "coupon-tap-to-expand-hint-seen";
// 매장에서 바코드를 오래 가리지 않도록 잠깐만 보여 줌
const HINT_DURATION = 3200; // ms
const RIPPLE_DURATION = 1.2; // s

function hasSeenHint() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    // 저장소를 못 쓰는 환경에서는 매번 띄우지 않음
    return true;
  }
}

function markHintSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {}
}

interface TapToExpandHintProps {
  /** 사진을 누르거나 넘겼으면 바로 숨김 */
  dismissed: boolean;
}

/** 처음 한 번, 쿠폰 사진을 누르면 크게 볼 수 있다는 걸 손가락 표시로 알려 줌 */
function TapToExpandHint({ dismissed }: TapToExpandHintProps) {
  const [isVisible, setIsVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (hasSeenHint()) return;
    markHintSeen();
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => setIsVisible(false), HINT_DURATION);
    return () => clearTimeout(timer);
  }, [isVisible]);

  // 한 번 숨겼으면 처음 쿠폰으로 돌아와도 다시 띄우지 않음
  useEffect(() => {
    if (dismissed) setIsVisible(false);
  }, [dismissed]);

  return (
    <AnimatePresence>
      {isVisible && (
        // 누르면 아래 사진이 눌리도록 표시만 함 (사진에 이미 "크게 보기" 이름이 있음)
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="relative flex size-16 items-center justify-center">
            {!shouldReduceMotion && (
              <motion.span
                className="absolute inset-0 rounded-full border-2 border-white"
                initial={{ scale: 0.8, opacity: 0.8 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{
                  duration: RIPPLE_DURATION,
                  ease: "easeOut",
                  repeat: Infinity,
                }}
              />
            )}
            <motion.div
              className="flex size-16 items-center justify-center rounded-full bg-black/55 shadow-lg backdrop-blur-sm"
              animate={shouldReduceMotion ? undefined : { scale: [1, 0.88, 1] }}
              transition={{
                duration: RIPPLE_DURATION,
                times: [0, 0.2, 0.5],
                repeat: Infinity,
              }}
            >
              <Pointer className="size-7 stroke-white" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TapToExpandHint;
