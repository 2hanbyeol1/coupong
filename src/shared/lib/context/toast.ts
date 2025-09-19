import { createContext } from "react";

export interface ToastType {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number; // ms
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
