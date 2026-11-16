"use client";
import useModal from "@/shared/lib/hook/useModal";

import AddOrganizationForm from "./AddOrganizationForm";

const ADD_ORGANIZATION_FORM_ID = "add-organization";

/** 새 그룹 만들기 모달을 여는 함수 */
function useAddOrganizationModal() {
  const { showModal } = useModal();

  return () => {
    showModal({
      title: "새 그룹 만들기",
      content: <AddOrganizationForm formId={ADD_ORGANIZATION_FORM_ID} />,
      confirmButtonText: "등록",
      formId: ADD_ORGANIZATION_FORM_ID,
    });
  };
}

export default useAddOrganizationModal;
