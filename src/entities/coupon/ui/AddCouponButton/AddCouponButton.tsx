"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";

import { ROUTES } from "@/shared/config/routes";

function AddCouponButton() {
  const { scrollY } = useScroll();
  const prevScrollY = useRef(0);

  const [isHidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (scrollY) => {
    if (scrollY > prevScrollY.current && scrollY > 0) {
      // 스크롤 내림
      setHidden(true);
      return;
    }
    setHidden(false);
    prevScrollY.current = scrollY;
  });

  return (
    <AnimatePresence>
      {!isHidden && (
        <motion.a
          href={ROUTES.ADD_COUPON}
          className="bg-light fixed bottom-7 left-1/2 -translate-x-1/2 rounded-md px-7 py-2.5 text-sm font-medium text-black shadow-lg"
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.8 }}
        >
          쿠폰 추가하기
        </motion.a>
      )}
    </AnimatePresence>
  );
}

export default AddCouponButton;
