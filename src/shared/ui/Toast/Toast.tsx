"use client";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import ToastContext, { ToastType } from "@/shared/lib/context/toast";
import useToast from "@/shared/lib/hook/useToast";

interface ToastProps {
  toast: ToastType;
}

function Toast({ toast: { id, message, duration = 3000 } }: ToastProps) {
  const { deleteToast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      deleteToast(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, deleteToast]);

  return (
    <motion.div
      layout
      initial={{ y: -16, opacity: 0, scale: 0.96 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -8, opacity: 0, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="pointer-events-auto w-full overflow-hidden rounded-xl border border-white/10 bg-black/80 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)] backdrop-blur-lg sm:min-w-[320px]"
      role="status"
    >
      <div className="flex items-center justify-center gap-3 py-3 pr-3 pl-5">
        <span className="flex-1 text-base leading-relaxed break-keep whitespace-pre-wrap text-slate-50">
          {message}
        </span>
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

  const addToast = useCallback((toast: Omit<ToastType, "id">) => {
    setToasts((prev) => [...prev, { ...toast, id: uuidv4() }]);
  }, []);

  const deleteToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, deleteToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 top-4 z-50 flex flex-col gap-2 sm:inset-x-auto sm:right-4">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
