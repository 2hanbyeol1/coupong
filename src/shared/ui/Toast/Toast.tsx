"use client";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import ToastContext, { ToastType } from "@/shared/lib/context/toast";
import useToast from "@/shared/lib/hook/useToast";

interface ToastProps {
  toast: ToastType;
}

function Toast({
  toast: { id, message, type = "success", duration },
}: ToastProps) {
  const { deleteToast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      deleteToast(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, deleteToast]);

  const handleDeleteToast = () => {
    deleteToast(id);
  };

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        layout
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.3,
        }}
        className="min-w-[300px] rounded-lg bg-white p-4 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <span className="">{message}</span>
          <motion.button
            onClick={handleDeleteToast}
            className="ml-4 cursor-pointer rounded-full p-2 hover:bg-black/10"
          >
            <X className="h-4 w-4" />
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const addToast = useCallback((toast: Omit<ToastType, "id">) => {
    setToasts((prev) => [...prev, { ...toast, id: crypto.randomUUID() }]);
  }, []);

  const deleteToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, deleteToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-1">
        {toasts.map((toast) => (
          <AnimatePresence key={toast.id} mode="popLayout">
            <Toast toast={toast} />
          </AnimatePresence>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
