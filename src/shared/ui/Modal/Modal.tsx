"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import ModalContext, { ModalType } from "@/shared/lib/context/modal";
import useModal from "@/shared/lib/hook/useModal";

import { Button } from "../Button";
import { CenteredView } from "../CenteredView";

function Modal({ modal }: { modal: ModalType | null }) {
  const { hideModal } = useModal();

  return (
    <>
      {modal && (
        <CenteredView className="fixed top-0 left-0 z-50 bg-black/10 backdrop-blur-sm">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -100 }}
              className="flex min-w-72 flex-col gap-6 rounded-xl bg-white px-6 py-8 shadow-lg"
            >
              <div className="flex flex-col items-center gap-1.5">
                <div className="text-base font-medium">{modal?.title}</div>
                <div className="text-sm text-gray-500">{modal.message}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button color="light" size="sm" onClick={hideModal}>
                  취소
                </Button>
                <Button size="sm" onClick={modal.onConfirm}>
                  확인
                </Button>
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

  const showModal = (modal: ModalType) => {
    setModal(modal);
  };

  const hideModal = () => {
    setModal(null);
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      <Modal modal={modal} />
    </ModalContext.Provider>
  );
}

export default Modal;
