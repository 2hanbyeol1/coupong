"use client";
import {
  MouseEvent as ReactMouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { MoreVertical } from "lucide-react";

import { cn } from "@/shared/lib/util/cn";

export interface MoreMenuItem {
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
}

export interface MoreMenuProps {
  items: MoreMenuItem[];
  className?: string;
}

function MoreMenu({ items, className }: MoreMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const handleItemClick = (e: ReactMouseEvent, item: MoreMenuItem) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    item.onClick();
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
                {items.map((item, idx) => (
                  <button
                    key={idx}
                    role="menuitem"
                    type="button"
                    onClick={(e) => handleItemClick(e, item)}
                    className={cn(
                      "block w-full cursor-pointer px-4 py-2.5 text-left text-sm",
                      item.variant === "danger"
                        ? "text-red-500 hover:bg-red-50"
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
        )}
    </>
  );
}

export default MoreMenu;
