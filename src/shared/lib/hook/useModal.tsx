import { useContext } from "react";

import ModalContext from "../context/modal";

function useModal() {
  const { showModal, hideModal, updateModal } = useContext(ModalContext);

  return { showModal, hideModal, updateModal };
}

export default useModal;
