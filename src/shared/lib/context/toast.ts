import { createContext } from "react";

export interface ToastType {
  id: string;
  message: string;
  duration?: number; // ms
  /** 메시지 옆 버튼 (예: 되돌리기). 누르면 실행하고 토스트를 닫음 */
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  addToast: (toastType: Omit<ToastType, "id">) => void;
  deleteToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  addToast: () => {},
  deleteToast: () => {},
});

export default ToastContext;
