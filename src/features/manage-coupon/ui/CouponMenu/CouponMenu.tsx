"use client";
import {
  MouseEvent as ReactMouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";

import { deleteCouponOption } from "@/entities/coupon/api/query";
import { CouponType } from "@/entities/coupon/api/type";
import { getMyInfoOption } from "@/entities/user/api/query";
import { ROUTES } from "@/shared/config/routes";
import useModal from "@/shared/lib/hook/useModal";
import { cn } from "@/shared/lib/util/cn";

export interface CouponMenuProps {
  coupon: CouponType;
  className?: string;
  redirectOnDelete?: boolean;
}

function CouponMenu({
  coupon,
  className,
  redirectOnDelete = false,
}: CouponMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: me } = useQuery(getMyInfoOption());
  const { showModal, hideModal } = useModal();

  const { mutate: deleteCoupon } = useMutation({
    ...deleteCouponOption(queryClient, {
      onSuccess: () => {
        if (redirectOnDelete) router.replace(ROUTES.HOME);
      },
    }),
  });

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: globalThis.MouseEvent) => {
      if (containerRef.current?.contains(e.target as Node)) return;
      setIsOpen(false);
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  if (me?.user_id !== coupon.uploaded_by) return null;

  const handleToggle = (e: ReactMouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const handleDelete = (e: ReactMouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    showModal({
      title: "쿠폰을 삭제할까요?",
      content: "삭제된 쿠폰은 되돌릴 수 없어요.",
      confirmButtonText: "삭제",
      onConfirm: () => {
        deleteCoupon(coupon.id);
        hideModal();
      },
    });
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-label="더보기"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={handleToggle}
        className="flex cursor-pointer items-center justify-center p-1"
      >
        <MoreVertical className="stroke-dark size-4" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full right-0 z-20 mt-1 min-w-32 origin-top-right overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5"
          >
            {/* TODO: 수정하기 메뉴 자리
            <button
              role="menuitem"
              type="button"
              onClick={handleEdit}
              className="hover:bg-light/40 block w-full cursor-pointer px-4 py-2.5 text-left text-sm"
            >
              수정하기
            </button>
            */}
            <button
              role="menuitem"
              type="button"
              onClick={handleDelete}
              className="block w-full cursor-pointer px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50"
            >
              삭제하기
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CouponMenu;
