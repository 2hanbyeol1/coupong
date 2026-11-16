"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getMyOrganizationIdsOption } from "@/entities/organization/api/query";
import { BottomSheet, Button } from "@/shared/ui";
import { InfoMessage } from "@/shared/ui/InfoMessage";

import useAddOrganizationModal from "../../../add-organization/ui/AddOrganizationButton/useAddOrganizationModal";
import { MyOrganizationList } from "../MyOrganizationList";

/**
 * 선택한 그룹이 없을 때의 안내
 * 속한 그룹이 없으면 그룹 만들기, 있으면 그룹 선택 버튼을 바로 보여줌
 */
function SelectOrganizationPrompt() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const openAddOrganizationModal = useAddOrganizationModal();
  const { data: myOrganizationIds, isPending } = useQuery({
    ...getMyOrganizationIdsOption(),
    throwOnError: false,
  });

  const hasNoOrganization = myOrganizationIds?.length === 0;
  const closeSheet = () => setIsSheetOpen(false);

  return (
    <div className="flex flex-col items-center pb-6">
      {hasNoOrganization ? (
        <InfoMessage
          title="아직 참여한 그룹이 없어요"
          description={
            "그룹을 만들어 쿠폰을 모아보세요\n초대를 받으면 그 그룹에도 들어갈 수 있어요"
          }
        />
      ) : (
        <InfoMessage
          title="그룹을 선택해 주세요"
          description="쿠폰을 확인하려면 그룹을 선택해 주세요"
        />
      )}

      {/* 그룹이 있는지 확인하는 동안 버튼이 바뀌어 보이지 않도록 자리만 잡아둠 */}
      {isPending ? (
        <div className="h-10" />
      ) : hasNoOrganization ? (
        <Button onClick={openAddOrganizationModal}>그룹 만들기</Button>
      ) : (
        <Button onClick={() => setIsSheetOpen(true)}>그룹 선택하기</Button>
      )}

      <BottomSheet open={isSheetOpen} onClose={closeSheet} title="그룹 선택">
        <MyOrganizationList onSelect={closeSheet} />
      </BottomSheet>
    </div>
  );
}

export default SelectOrganizationPrompt;
