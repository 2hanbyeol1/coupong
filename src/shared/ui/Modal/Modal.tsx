"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import ModalContext, { ModalType } from "@/shared/lib/context/modal";
import useModal from "@/shared/lib/hook/useModal";

import { Button } from "../Button";
import { CenteredView } from "../CenteredView";
import { Checkbox } from "../Checkbox";

function Modal({ modal }: { modal: ModalType | null }) {
  const { hideModal } = useModal();
  const [isChecked, setIsChecked] = useState(false);

  return (
    <>
      {modal && (
        <CenteredView className="fixed top-0 left-0 z-50 bg-black/15 backdrop-blur-md">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -100 }}
              className="flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-7 rounded-xl bg-white px-6 py-8 shadow-lg"
            >
              <div className="flex flex-col items-center gap-2 px-1">
                <div className="text-lg font-semibold">{modal?.title}</div>
                <div className="w-full text-center text-base text-gray-500">
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
                  <Button color="light" size="lg" onClick={hideModal}>
                    취소
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
          </AnimatePresence>
        </CenteredView>
      )}
    </>
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
      <Modal key={modalKey} modal={modal} />
    </ModalContext.Provider>
  );
}

export default Modal;
