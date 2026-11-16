import { createContext, ReactNode } from "react";

export interface ModalType {
  title?: string;
  content: string | ReactNode;
  /** 체크박스를 켰다면 checked가 true */
  onConfirm?: (options: { checked: boolean }) => void;
  /** 버튼 바로 위에 표시할 체크박스 문구 (예: 다시 묻지 않기). 없으면 체크박스를 표시하지 않음 */
  checkboxLabel?: string;
  confirmButtonText?: string;
  /** 왼쪽(보조) 버튼 문구, 기본은 '취소' */
  cancelButtonText?: string;
  /** 왼쪽 버튼을 눌렀을 때, 없으면 모달만 닫음 */
  onCancel?: () => void;
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
