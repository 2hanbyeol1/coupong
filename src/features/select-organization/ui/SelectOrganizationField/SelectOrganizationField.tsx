"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronRight } from "lucide-react";

import { useOrganizationStore } from "@/entities/organization/model/store";
import { SelectedOrganization } from "@/entities/organization/ui/SelectedOrganization";
import { cn } from "@/shared/lib/util/cn";
import { BottomSheet } from "@/shared/ui";

import { MyOrganizationList } from "../MyOrganizationList";

interface SelectOrganizationFieldProps {
  className?: string;
}

function SelectOrganizationField({ className }: SelectOrganizationFieldProps) {
  const { selectedOrganizationId, isHydrated } = useOrganizationStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 폼 안에 놓여도 목록의 버튼이 폼을 제출하지 않도록 시트는 body에 렌더링
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const hasSelected = !!selectedOrganizationId;
  const closeSheet = () => setIsOpen(false);

  return (
    <>
      <div className={cn("flex items-center gap-1.5 text-base", className)}>
        {isHydrated && !hasSelected ? (
          <span className="text-black/70">등록할 그룹을 선택해주세요</span>
        ) : (
          <span className="flex min-w-0 items-center gap-1 text-black/70">
            <SelectedOrganization className="text-primary truncate font-semibold" />
            <span className="shrink-0">그룹에 등록돼요</span>
          </span>
        )}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="text-dark flex shrink-0 cursor-pointer items-center gap-0.5 py-1 pl-1"
        >
          {hasSelected ? "변경" : "선택"}
          <ChevronRight size={18} />
        </button>
      </div>

      {isMounted &&
        createPortal(
          <BottomSheet open={isOpen} onClose={closeSheet} title="그룹 선택">
            <MyOrganizationList onSelect={closeSheet} />
          </BottomSheet>,
          document.body,
        )}
    </>
  );
}

export default SelectOrganizationField;
