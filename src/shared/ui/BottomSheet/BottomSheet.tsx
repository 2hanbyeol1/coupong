"use client";
import { ReactNode, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  PanInfo,
  useDragControls,
} from "framer-motion";

import { cn } from "@/shared/lib/util/cn";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** 이만큼(px) 끌어내리거나 이 속도(px/s)보다 빠르게 내리면 닫힘 */
const CLOSE_DRAG_OFFSET = 120;
const CLOSE_DRAG_VELOCITY = 500;

const SHEET_TRANSITION = {
  type: "spring",
  damping: 34,
  stiffness: 380,
} as const;

/**
 * 화면 아래에서 올라오는 시트
 * - 손잡이를 누르거나, 손잡이·제목 영역을 아래로 끌거나, 바깥을 누르거나, ESC를 누르면 닫힘
 * - 폼이나 transform이 걸린 화면 안에서 써도 화면 전체를 덮도록 body에 렌더링
 *   (폼 밖에 그려지므로 시트 안 버튼이 폼을 제출하지 않음)
 */
function BottomSheet({
  open,
  onClose,
  title,
  children,
  className,
}: BottomSheetProps) {
  const titleId = useId();
  const dragControls = useDragControls();
  const [isMounted, setIsMounted] = useState(false);
  // 열려 있는 동안 onClose가 바뀌어도 아래 효과를 다시 걸지 않도록 최신 값만 참조
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 열려 있는 동안 뒤 화면이 스크롤되지 않게 막고, ESC로 닫기
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleDragEnd = (_: PointerEvent, info: PanInfo) => {
    if (
      info.offset.y > CLOSE_DRAG_OFFSET ||
      info.velocity.y > CLOSE_DRAG_VELOCITY
    ) {
      onClose();
    }
  };

  if (!isMounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="bottom-sheet-backdrop"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={onClose}
          />
          <motion.div
            key="bottom-sheet-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={SHEET_TRANSITION}
            // 내용을 스크롤할 때는 끌리지 않도록 손잡이·제목 영역에서만 끌기 시작
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={handleDragEnd}
            className={cn(
              "fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] w-full flex-col rounded-t-3xl bg-white shadow-[0_-8px_32px_rgba(0,0,0,0.12)]",
              className,
            )}
          >
            <div
              onPointerDown={(event) => dragControls.start(event)}
              className="shrink-0 cursor-grab touch-none px-5 active:cursor-grabbing"
            >
              {/* 누르면 닫히는 손잡이 (누를 영역은 막대보다 넓게) */}
              <button
                type="button"
                onClick={onClose}
                aria-label="닫기"
                className="mx-auto flex h-6 w-16 cursor-pointer items-center justify-center"
              >
                <span className="h-1 w-10 rounded-full bg-black/15" />
              </button>
              {title &&
                (typeof title === "string" ? (
                  <h2
                    id={titleId}
                    className="pt-3 pb-1 text-center text-lg font-semibold"
                  >
                    {title}
                  </h2>
                ) : (
                  <div id={titleId} className="flex justify-center pt-3 pb-1">
                    {title}
                  </div>
                ))}
            </div>
            {/* 패딩 안쪽까지 스크롤 영역이라, 칸 바깥으로 그려지는 포커스 테두리도 잘리지 않음 */}
            <div className="flex min-h-0 flex-col overflow-y-auto overscroll-contain px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export default BottomSheet;
