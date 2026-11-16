"use client";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { getMyOrganizationIdsOption } from "@/entities/organization/api/query";
import { useOrganizationStore } from "@/entities/organization/model/store";
import useToast from "@/shared/lib/hook/useToast";

/**
 * 저장해 둔 선택 그룹을 내가 속한 그룹과 맞춤 (화면에는 아무것도 그리지 않음)
 * - 그룹에서 내보내져 더 이상 속하지 않은 그룹이면 선택을 풀거나, 남은 그룹이 하나면 그 그룹을 선택
 * - 선택한 그룹이 없는데 속한 그룹이 하나뿐이면 자동으로 선택
 * 앱을 열 때, 앱으로 돌아올 때, 그룹을 만들거나 초대를 수락해 그룹 목록이 바뀔 때 확인함
 */
function SelectedOrganizationSync() {
  const {
    selectedOrganizationId,
    isHydrated,
    setSelectedOrganizationId,
    resetSelectedOrganization,
  } = useOrganizationStore();
  const { addToast } = useToast();

  const { data: myOrganizationIds } = useQuery({
    ...getMyOrganizationIdsOption(),
    enabled: isHydrated,
    // 확인에 실패해도 화면은 그대로 두고 다음 기회에 다시 확인
    throwOnError: false,
  });

  useEffect(() => {
    // 로그인 전(null)이거나 아직 불러오는 중
    if (!isHydrated || !myOrganizationIds) return;
    if (
      selectedOrganizationId &&
      myOrganizationIds.includes(selectedOrganizationId)
    )
      return;

    if (selectedOrganizationId) {
      addToast({ message: "선택했던 그룹에 더 이상 속해 있지 않아요" });
    }

    if (myOrganizationIds.length === 1) {
      setSelectedOrganizationId(myOrganizationIds[0]);
    } else if (selectedOrganizationId) {
      resetSelectedOrganization();
    }
  }, [
    isHydrated,
    myOrganizationIds,
    selectedOrganizationId,
    setSelectedOrganizationId,
    resetSelectedOrganization,
    addToast,
  ]);

  return null;
}

export default SelectedOrganizationSync;
