"use client";
import { useState } from "react";
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

      <BottomSheet open={isOpen} onClose={closeSheet} title="그룹 선택">
        <MyOrganizationList onSelect={closeSheet} />
      </BottomSheet>
    </>
  );
}

export default SelectOrganizationField;
