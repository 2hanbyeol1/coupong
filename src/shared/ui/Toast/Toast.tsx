"use client";
import { useCallback, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import ToastContext, { ToastType } from "@/shared/lib/context/toast";
import useToast from "@/shared/lib/hook/useToast";
import useVisualViewportOffsetTop from "@/shared/lib/hook/useVisualViewportOffsetTop";
import { cn } from "@/shared/lib/util/cn";

interface ToastProps {
  toast: ToastType;
}

function Toast({
  toast: { id, message, duration = 3000, placement = "top", action },
}: ToastProps) {
  const { deleteToast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      deleteToast(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, deleteToast]);

  // 놓인 쪽 가장자리에서 들어오고 나감
  const sign = placement === "bottom" ? 1 : -1;

  return (
    <motion.div
      layout
      initial={{ y: 16 * sign, opacity: 0, scale: 0.96 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 8 * sign, opacity: 0, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="pointer-events-auto w-full overflow-hidden rounded-xl border border-white/10 bg-black/80 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)] backdrop-blur-lg sm:min-w-[320px] dark:border-white/15 dark:bg-[#2a2a2a]/95"
      role="status"
    >
      <div className="flex items-center justify-center gap-3 py-3 pr-3 pl-5">
        <span className="flex-1 text-base leading-relaxed break-keep whitespace-pre-wrap text-slate-50">
          {message}
        </span>
        {action && (
          <button
            type="button"
            onClick={() => {
              action.onClick();
              deleteToast(id);
            }}
            className="shrink-0 cursor-pointer rounded-md px-2 py-1 text-sm font-semibold text-emerald-300 transition hover:bg-white/10"
          >
            {action.label}
          </button>
        )}
        <button
          type="button"
          onClick={() => deleteToast(id)}
          aria-label="닫기"
          className="cursor-pointer rounded-full p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const [bottomAnchor, setBottomAnchor] = useState<HTMLElement | null>(null);
  const viewportOffsetTop = useVisualViewportOffsetTop();

  const addToast = useCallback((toast: Omit<ToastType, "id">) => {
    setToasts((prev) => [...prev, { ...toast, id: uuidv4() }]);
  }, []);

  const deleteToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const topToasts = toasts.filter((toast) => toast.placement !== "bottom");
  const bottomToasts = toasts.filter((toast) => toast.placement === "bottom");

  const bottomList = (
    <div
      className={cn(
        "pointer-events-none flex flex-col gap-2",
        // 자리가 없으면 화면 아래쪽에 띄움
        !bottomAnchor &&
          "fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 sm:inset-x-auto sm:right-4",
      )}
    >
      <AnimatePresence mode="popLayout">
        {bottomToasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );

  return (
    <ToastContext.Provider value={{ addToast, deleteToast, setBottomAnchor }}>
      {children}
      {/* 키보드가 올라와 화면이 밀려도 보이는 영역 상단에 표시 */}
      <div
        className="pointer-events-none fixed inset-x-4 top-4 z-50 flex flex-col gap-2 sm:inset-x-auto sm:right-4"
        style={{ transform: `translateY(${viewportOffsetTop}px)` }}
      >
        <AnimatePresence mode="popLayout">
          {topToasts.map((toast) => (
            <Toast key={toast.id} toast={toast} />
          ))}
        </AnimatePresence>
      </div>
      {bottomAnchor ? createPortal(bottomList, bottomAnchor) : bottomList}
    </ToastContext.Provider>
  );
}

/**
 * placement: "bottom" 토스트가 뜰 자리.
 * 위치는 className으로 정하고, 화면에 하나만 둠
 */
export function ToastBottomAnchor({ className }: { className?: string }) {
  const { setBottomAnchor } = useContext(ToastContext);
  // 렌더할 때마다 다시 등록되지 않도록 고정
  const register = useCallback(
    (element: HTMLDivElement | null) => {
      setBottomAnchor(element);
      return () => setBottomAnchor(null);
    },
    [setBottomAnchor],
  );

  return (
    <div ref={register} className={cn("pointer-events-none", className)} />
  );
}

export default ToastProvider;
