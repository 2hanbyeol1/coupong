"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import Link from "next/link";

import { useOrganizationStore } from "@/entities/organization/model/store";
import { ROUTES } from "@/shared/config/routes";

/** 이만큼(px) 이상 내려야 버튼을 숨김 */
const HIDE_SCROLL_THRESHOLD = 8;

function AddCouponButton() {
  const { selectedOrganizationId } = useOrganizationStore();
  const { scrollY } = useScroll();
  const prevScrollY = useRef(0);

  const [isHidden, setHidden] = useState(false);

  // 관성 스크롤의 작은 흔들림에 버튼이 나타났다 사라졌다 하지 않도록,
  // 일정 거리 이상 내릴 때만 숨기고 조금이라도 올리면 다시 보여줌
  useMotionValueEvent(scrollY, "change", (scrollY) => {
    const delta = scrollY - prevScrollY.current;
    if (scrollY <= 0 || delta < 0) {
      setHidden(false);
      prevScrollY.current = scrollY;
    } else if (delta > HIDE_SCROLL_THRESHOLD) {
      setHidden(true);
      prevScrollY.current = scrollY;
    }
  });

  if (!selectedOrganizationId) return null;

  return (
    <AnimatePresence>
      {!isHidden && (
        <motion.div
          className="fixed bottom-7 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.8 }}
        >
          {/* 클라이언트 이동으로 페이지 전체 새로고침(흰 화면) 없이 진입 */}
          <Link
            href={ROUTES.ADD_COUPON}
            className="bg-light block rounded-md px-7 py-2.5 text-sm font-medium whitespace-nowrap text-black shadow-lg"
          >
            쿠폰 추가하기
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AddCouponButton;
