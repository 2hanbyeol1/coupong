"use client";
import {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/shared/lib/util/cn";

import MenuPopup, { MenuPosition, MoreMenuItem } from "../MoreMenu/MenuPopup";

export interface ContextMenuProps {
  items: MoreMenuItem[];
  children: ReactNode;
  /** true면 메뉴를 띄우지 않고 브라우저 기본 동작을 그대로 둠 */
  disabled?: boolean;
  className?: string;
}

/** 이 시간 동안 누르고 있으면 메뉴를 띄움 */
const LONG_PRESS_MS = 500;
/** 누르는 중 이만큼 움직이면 스크롤로 보고 취소 */
const LONG_PRESS_MOVE_TOLERANCE = 10;

/** 누른 지점에 메뉴를 띄우되, 화면 밖으로 나가지 않게 넓은 쪽으로 펼침 */
const getMenuPosition = (x: number, y: number): MenuPosition => ({
  ...(x > window.innerWidth / 2
    ? { right: window.innerWidth - x }
    : { left: x }),
  ...(y > window.innerHeight * 0.6
    ? { bottom: window.innerHeight - y }
    : { top: y }),
});

/**
 * 우클릭하거나 길게 누르면 그 자리에 메뉴를 띄움
 * - 데스크톱 우클릭·안드로이드 길게 누르기: contextmenu 이벤트
 * - iOS는 contextmenu가 없어 직접 시간을 잼
 */
function ContextMenu({
  items,
  children,
  disabled = false,
  className,
}: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ top: 0, left: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const pressRef = useRef<{
    timer: ReturnType<typeof setTimeout>;
    x: number;
    y: number;
  } | null>(null);
  // 길게 눌러 메뉴를 띄웠으면, 손을 뗄 때 생기는 클릭(링크 이동)을 막음
  const suppressClickRef = useRef(false);

  const cancelPress = () => {
    if (!pressRef.current) return;
    clearTimeout(pressRef.current.timer);
    pressRef.current = null;
  };

  useEffect(() => cancelPress, []);

  const openAt = (x: number, y: number) => {
    setPosition(getMenuPosition(x, y));
    setIsOpen(true);
  };

  // 메뉴는 포털로 띄워 React 트리상 이 컴포넌트 안에 있으므로, 화면상 안쪽에서 생긴 이벤트만 다룸
  const isInside = (target: EventTarget) =>
    containerRef.current?.contains(target as Node) ?? false;

  const handleContextMenu = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (disabled || !isInside(e.target)) return;
    e.preventDefault();
    cancelPress();
    // 키보드(메뉴 키·Shift+F10)로 열면 좌표가 없으므로 요소 가운데에
    if (e.clientX === 0 && e.clientY === 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      openAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return;
    }
    // 안드로이드는 길게 누르면 contextmenu가 먼저 오므로, 뒤따르는 클릭도 막음
    // (우클릭은 클릭을 만들지 않고, 다음에 누를 때 풀림)
    suppressClickRef.current = true;
    openAt(e.clientX, e.clientY);
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!isInside(e.target)) return;
    suppressClickRef.current = false;
    if (disabled || e.pointerType !== "touch") return;
    cancelPress();
    const { clientX: x, clientY: y } = e;
    pressRef.current = {
      x,
      y,
      timer: setTimeout(() => {
        pressRef.current = null;
        suppressClickRef.current = true;
        navigator.vibrate?.(10);
        openAt(x, y);
      }, LONG_PRESS_MS),
    };
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const press = pressRef.current;
    if (!press) return;
    if (
      Math.hypot(e.clientX - press.x, e.clientY - press.y) >
      LONG_PRESS_MOVE_TOLERANCE
    )
      cancelPress();
  };

  const handleClickCapture = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current || !isInside(e.target)) return;
    suppressClickRef.current = false;
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      ref={containerRef}
      onContextMenu={handleContextMenu}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={cancelPress}
      onPointerCancel={cancelPress}
      onClickCapture={handleClickCapture}
      className={cn(
        "transition-colors duration-150",
        // 길게 누를 때 iOS의 링크 미리보기·글자 선택이 뜨지 않게
        !disabled && "select-none [-webkit-touch-callout:none]",
        // 어떤 항목의 메뉴인지 보이도록 열려 있는 동안 배경 표시
        isOpen && "bg-light/60 rounded-lg",
        className,
      )}
    >
      {children}
      <MenuPopup
        open={isOpen}
        onClose={() => setIsOpen(false)}
        items={items}
        position={position}
      />
    </div>
  );
}

export default ContextMenu;
