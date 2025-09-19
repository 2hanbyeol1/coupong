import { createContext, ReactNode } from "react";

export interface ModalType {
  title?: string;
  content: string | ReactNode;
  onConfirm?: () => void;
  confirmButtonText?: string;
  formId?: string;
}

interface ModalContextType {
  showModal: (modalType: Omit<ModalType, "id">) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextType>({
  showModal: () => {},
  hideModal: () => {},
});

export default ModalContext;
