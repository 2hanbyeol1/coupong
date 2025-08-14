import { useContext } from "react";

import ToastContext from "@/shared/lib/context/toast";

function useToast() {
  const { addToast, deleteToast } = useContext(ToastContext);

  return { addToast, deleteToast };
}

export default useToast;
