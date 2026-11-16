"use client";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { getMyOrganizationIdsOption } from "@/entities/organization/api/query";
import { useOrganizationStore } from "@/entities/organization/model/store";
import useToast from "@/shared/lib/hook/useToast";

/**
 * 저장해 둔 선택 그룹을 내가 속한 그룹과 맞춤 (화면에는 아무것도 그리지 않음)
 * - 그룹에서 내보내져 더 이상 속하지 않은 그룹이면 선택을 풀어 그룹을 다시 고르게 함
 * 앱을 열 때, 앱으로 돌아올 때, 그룹 목록이 바뀔 때 확인함
 */
function SelectedOrganizationSync() {
  const { selectedOrganizationId, isHydrated, resetSelectedOrganization } =
    useOrganizationStore();
  const { addToast } = useToast();

  const { data: myOrganizationIds } = useQuery({
    ...getMyOrganizationIdsOption(),
    enabled: isHydrated,
    // 확인에 실패해도 화면은 그대로 두고 다음 기회에 다시 확인
    throwOnError: false,
  });

  useEffect(() => {
    // 로그인 전(null)이거나 아직 불러오는 중
    if (!isHydrated || !myOrganizationIds || !selectedOrganizationId) return;
    if (myOrganizationIds.includes(selectedOrganizationId)) return;

    addToast({ message: "선택했던 그룹에 더 이상 속해 있지 않아요" });
    resetSelectedOrganization();
  }, [
    isHydrated,
    myOrganizationIds,
    selectedOrganizationId,
    resetSelectedOrganization,
    addToast,
  ]);

  return null;
}

export default SelectedOrganizationSync;
