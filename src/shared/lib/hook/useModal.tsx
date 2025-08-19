import { useContext } from "react";

import ModalContext from "../context/modal";

function useModal() {
  const { showModal, hideModal } = useContext(ModalContext);

  return { showModal, hideModal };
}

export default useModal;
