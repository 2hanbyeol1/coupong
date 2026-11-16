"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import ModalContext, { ModalType } from "@/shared/lib/context/modal";
import useModal from "@/shared/lib/hook/useModal";

import { Button } from "../Button";
import { Checkbox } from "../Checkbox";

function Modal({ modal }: { modal: ModalType }) {
  const { hideModal } = useModal();
  const [isChecked, setIsChecked] = useState(false);

  return (
    // 닫힐 때도 배경이 흐려지며 패널이 내려가도록 배경·패널 모두 exit 애니메이션
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/15 backdrop-blur-md dark:bg-black/50"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={modal.title}
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-elevated flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-7 rounded-xl px-6 py-8 shadow-lg"
      >
        <div className="flex flex-col items-center gap-2 px-1">
          <div className="text-lg font-semibold">{modal.title}</div>
          <div className="text-dark w-full text-center text-base">
            {modal.content}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {modal.checkboxLabel && (
            <Checkbox
              className="self-start text-base"
              checked={isChecked}
              onChange={setIsChecked}
            >
              {modal.checkboxLabel}
            </Checkbox>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Button
              color="light"
              size="lg"
              onClick={modal.onCancel ?? hideModal}
            >
              {modal.cancelButtonText ?? "취소"}
            </Button>
            <Button
              type={modal.formId ? "submit" : "button"}
              size="lg"
              onClick={() => modal.onConfirm?.({ checked: isChecked })}
              form={modal.formId}
              disabled={modal.confirmButtonDisabled}
            >
              {modal.confirmButtonText ?? "확인"}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<ModalType | null>(null);
  // 새 모달을 열 때마다 바뀌어, 체크박스 등 모달 안 상태를 초기화
  const [modalKey, setModalKey] = useState(0);

  const showModal = useCallback((modal: ModalType) => {
    setModal(modal);
    setModalKey((prev) => prev + 1);
  }, []);

  const hideModal = useCallback(() => {
    setModal(null);
  }, []);

  const updateModal = useCallback((partial: Partial<ModalType>) => {
    setModal((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  const value = useMemo(
    () => ({ showModal, hideModal, updateModal }),
    [showModal, hideModal, updateModal],
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
      {/* 조건부 렌더링 바깥에 두어야 닫힐 때 exit 애니메이션이 재생됨 */}
      <AnimatePresence>
        {modal && <Modal key={modalKey} modal={modal} />}
      </AnimatePresence>
    </ModalContext.Provider>
  );
}

export default Modal;
