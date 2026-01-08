"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { SelectedOrganization } from "@/entities/organization/ui/SelectedOrganization";
import { cn } from "@/shared/lib/util/cn";

import { MyOrganizationList } from "../MyOrganizationList";

function SelectOrganizationButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleButtonClick = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <button
        className="flex cursor-pointer items-center gap-1"
        onClick={handleButtonClick}
      >
        <SelectedOrganization className="text-primary cursor-pointer items-center gap-1 text-xl font-semibold" />
        <ChevronDown
          className={cn(
            "stroke-primary/80 duration-200",
            isOpen && "-rotate-180",
          )}
          size={20}
        />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 flex w-full flex-col gap-4 rounded-b-2xl bg-white px-6 py-8 shadow-2xl">
          <div className="text-lg font-medium">그룹을 선택해 주세요</div>
          <MyOrganizationList className="pb-2" onSelect={handleButtonClick} />
        </div>
      )}
    </>
  );
}

export default SelectOrganizationButton;
