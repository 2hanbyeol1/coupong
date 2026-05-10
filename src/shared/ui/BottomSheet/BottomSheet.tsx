"use client";
import { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { cn } from "@/shared/lib/util/cn";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}

function BottomSheet({
  open,
  onClose,
  title,
  children,
  className,
}: BottomSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="bottom-sheet-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col bg-black/40"
          onClick={onClose}
        >
          <motion.div
            key="bottom-sheet-panel"
            role="dialog"
            aria-modal="true"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={cn(
              "mt-auto flex max-h-[80%] flex-col gap-4 rounded-t-xl bg-white p-4",
              className,
            )}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              {typeof title === "string" ? (
                <h2 className="text-base font-semibold">{title}</h2>
              ) : (
                (title ?? <span />)
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="닫기"
                className="flex h-8 w-8 cursor-pointer items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex min-h-0 flex-col overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default BottomSheet;
