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

/** 버튼과 메뉴 사이 간격 */
const MENU_GAP = 4;
/** 메뉴 항목 하나의 높이 (py-2.5 + text-sm 줄 높이) */
const MENU_ITEM_HEIGHT = 40;
/** 화면 가장자리에 붙지 않도록 남겨둘 여백 */
const VIEWPORT_MARGIN = 8;

/** 버튼 아래에 메뉴가 들어갈 자리가 없으면 위로 펼침 */
const getMenuPosition = (rect: DOMRect, itemCount: number): MenuPosition => {
  const menuHeight = itemCount * MENU_ITEM_HEIGHT;
  const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_MARGIN;
  const spaceAbove = rect.top - VIEWPORT_MARGIN;
  const opensUp = spaceBelow < menuHeight + MENU_GAP && spaceAbove > spaceBelow;
  const right = Math.max(0, window.innerWidth - rect.right);

  return opensUp
    ? { bottom: window.innerHeight - rect.top + MENU_GAP, right }
    : { top: rect.bottom + MENU_GAP, right };
};

function MoreMenu({ items, className }: MoreMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ top: 0, right: 0 });

  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (e: ReactMouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOpen) {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) setPosition(getMenuPosition(rect, items.length));
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
