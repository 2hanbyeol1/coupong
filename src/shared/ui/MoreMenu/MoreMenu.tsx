"use client";
import { MouseEvent as ReactMouseEvent, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";

import { cn } from "@/shared/lib/util/cn";

import MenuPopup, { MenuPosition, MoreMenuItem } from "./MenuPopup";

export type { MoreMenuItem };

export interface MoreMenuProps {
  items: MoreMenuItem[];
  className?: string;
}

function MoreMenu({ items, className }: MoreMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ top: 0, right: 0 });

  const triggerRef = useRef<HTMLButtonElement>(null);

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
      <MenuPopup
        open={isOpen}
        onClose={() => setIsOpen(false)}
        items={items}
        position={position}
        ignoreRef={triggerRef}
      />
    </>
  );
}

export default MoreMenu;
