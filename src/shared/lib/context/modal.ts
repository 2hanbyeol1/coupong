import { createContext, ReactNode } from "react";

export interface ModalType {
  title?: string;
  content: string | ReactNode;
  onConfirm?: () => void;
  confirmButtonText?: string;
  confirmButtonDisabled?: boolean;
  formId?: string;
}

interface ModalContextType {
  showModal: (modalType: Omit<ModalType, "id">) => void;
  hideModal: () => void;
  updateModal: (partial: Partial<ModalType>) => void;
}

const ModalContext = createContext<ModalContextType>({
  showModal: () => {},
  hideModal: () => {},
  updateModal: () => {},
});

export default ModalContext;
