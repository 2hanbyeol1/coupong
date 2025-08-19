import { createContext } from "react";

export interface ModalType {
  title?: string;
  message: string;
  onConfirm: () => void;
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
