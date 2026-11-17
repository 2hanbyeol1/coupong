import { createContext } from "react";

export interface ToastType {
  id: string;
  message: string;
  duration?: number; // ms
  /**
   * 표시 위치 (기본: top)
   * - bottom: 화면에 ToastBottomAnchor가 있으면 그 자리에, 없으면 화면 아래쪽에 표시
   */
  placement?: "top" | "bottom";
  /** 메시지 옆 버튼 (예: 되돌리기). 누르면 실행하고 토스트를 닫음 */
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  addToast: (toastType: Omit<ToastType, "id">) => void;
  deleteToast: (id: string) => void;
  /** 아래쪽 토스트를 띄울 자리 등록 (ToastBottomAnchor가 사용) */
  setBottomAnchor: (element: HTMLElement | null) => void;
}

const ToastContext = createContext<ToastContextType>({
  addToast: () => {},
  deleteToast: () => {},
  setBottomAnchor: () => {},
});

export default ToastContext;
