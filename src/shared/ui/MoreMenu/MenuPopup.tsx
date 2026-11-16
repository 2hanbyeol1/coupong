"use client";
import {
  CSSProperties,
  MouseEvent as ReactMouseEvent,
  RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/shared/lib/util/cn";

export interface MoreMenuItem {
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
}

/** 화면 기준 메뉴 위치 (top/bottom 중 하나, left/right 중 하나) */
export interface MenuPosition {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

interface MenuPopupProps {
  open: boolean;
  onClose: () => void;
  items: MoreMenuItem[];
  position: MenuPosition;
  /** 이 요소를 누르면 바깥을 누른 것으로 보지 않음 (메뉴를 연 버튼 등) */
  ignoreRef?: RefObject<HTMLElement | null>;
}

/** 메뉴가 펼쳐지는 기준점 (위치에 맞춰 그 모서리에서 커짐) */
const getTransformOrigin = ({ bottom, right }: MenuPosition) =>
  `${bottom !== undefined ? "bottom" : "top"} ${right !== undefined ? "right" : "left"}`;

/** 화면 위에 띄우는 메뉴. 바깥을 누르거나 Esc·스크롤·화면 크기 변경 시 닫힘 */
function MenuPopup({
  open,
  onClose,
  items,
  position,
  ignoreRef,
}: MenuPopupProps) {
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = () => onCloseRef.current();

    const handleClickOutside = (e: globalThis.MouseEvent) => {
      const target = e.target as Node;
      if (
        ignoreRef?.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      close();
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open, ignoreRef]);

  const handleItemClick = (e: ReactMouseEvent, item: MoreMenuItem) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
    item.onClick();
  };

  if (!mounted) return null;

  const style: CSSProperties = {
    position: "fixed",
    ...position,
    transformOrigin: getTransformOrigin(position),
  };
  const offsetY = position.bottom !== undefined ? 4 : -4;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={menuRef}
          role="menu"
          initial={{ opacity: 0, scale: 0.95, y: offsetY }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: offsetY }}
          transition={{ duration: 0.12 }}
          style={style}
          className="bg-elevated ring-ink/5 z-[100] min-w-32 overflow-hidden rounded-lg shadow-lg ring-1"
        >
          {items.map((item, idx) => (
            <button
              key={idx}
              role="menuitem"
              type="button"
              onClick={(e) => handleItemClick(e, item)}
              className={cn(
                "block w-full cursor-pointer px-4 py-2.5 text-left text-sm",
                item.variant === "danger"
                  ? "text-error hover:bg-error/8"
                  : "hover:bg-light/40",
              )}
            >
              {item.label}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export default MenuPopup;
