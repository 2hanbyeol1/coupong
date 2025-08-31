import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { SelectedOrg } from "@/entities/organization/ui/SelectedOrg";
import { cn } from "@/shared/lib/util/cn";

import { MyOrgsList } from "../MyOrgsList";

function SelectOrgButton() {
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
        <SelectedOrg className="text-primary cursor-pointer items-center gap-1 text-xl font-semibold" />
        <ChevronDown
          className={cn(
            "stroke-primary/70 duration-200",
            isOpen && "-rotate-180",
          )}
          size={24}
        />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 flex w-full flex-col gap-5 rounded-b-2xl bg-white px-6 py-8 shadow-2xl">
          <div className="text-xl font-medium">그룹을 선택해 주세요</div>
          <MyOrgsList className="pb-8" onSelect={handleButtonClick} />
        </div>
      )}
    </>
  );
}

export default SelectOrgButton;
