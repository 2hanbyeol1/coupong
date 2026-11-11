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

function AddCouponButton() {
  const { selectedOrganizationId } = useOrganizationStore();
  const { scrollY } = useScroll();
  const prevScrollY = useRef(0);

  const [isHidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (scrollY) => {
    setHidden(scrollY > prevScrollY.current && scrollY > 0); // 스크롤 내리면 버튼 숨기기
    prevScrollY.current = scrollY;
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
