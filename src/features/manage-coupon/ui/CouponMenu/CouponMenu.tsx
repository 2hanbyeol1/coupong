"use client";
import {
  MouseEvent as ReactMouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";

import { deleteCouponOption } from "@/entities/coupon/api/query";
import { CouponType } from "@/entities/coupon/api/type";
import { getMyInfoOption } from "@/entities/user/api/query";
import { EditCouponForm } from "@/features/manage-coupon/ui/EditCouponForm";
import { ROUTES } from "@/shared/config/routes";
import useModal from "@/shared/lib/hook/useModal";
import { cn } from "@/shared/lib/util/cn";

const EDIT_COUPON_FORM_ID = "edit-coupon";

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
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: globalThis.MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    const handleDismiss = () => setIsOpen(false);

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("scroll", handleDismiss, true);
    window.addEventListener("resize", handleDismiss);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", handleDismiss, true);
      window.removeEventListener("resize", handleDismiss);
    };
  }, [isOpen]);

  if (me?.user_id !== coupon.uploaded_by) return null;

  const handleToggle = (e: ReactMouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOpen) {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) {
        setPosition({
          top: rect.bottom + 4,
          right: Math.max(0, window.innerWidth - rect.right),
        });
      }
    }
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

  const handleEdit = (e: ReactMouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    showModal({
      title: "쿠폰 수정",
      content: <EditCouponForm coupon={coupon} formId={EDIT_COUPON_FORM_ID} />,
      confirmButtonText: "수정",
      formId: EDIT_COUPON_FORM_ID,
    });
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="더보기"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={handleToggle}
        className={cn(
          "flex cursor-pointer items-center justify-center p-1",
          className,
        )}
      >
        <MoreVertical className="stroke-dark size-4" />
      </button>
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={menuRef}
                role="menu"
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.12 }}
                style={{
                  position: "fixed",
                  top: position.top,
                  right: position.right,
                }}
                className="z-[100] min-w-32 origin-top-right overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5"
              >
                <button
                  role="menuitem"
                  type="button"
                  onClick={handleDelete}
                  className="block w-full cursor-pointer px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50"
                >
                  삭제하기
                </button>
                <button
                  role="menuitem"
                  type="button"
                  onClick={handleEdit}
                  className="hover:bg-light/40 block w-full cursor-pointer px-4 py-2.5 text-left text-sm"
                >
                  수정하기
                </button>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}

export default CouponMenu;
