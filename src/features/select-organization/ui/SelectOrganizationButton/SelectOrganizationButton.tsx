"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { SelectedOrganization } from "@/entities/organization/ui/SelectedOrganization";
import { cn } from "@/shared/lib/util/cn";

import { MyOrganizationList } from "../MyOrganizationList";

/** BottomSheet와 같은 움직임 */
const PANEL_TRANSITION = {
  type: "spring",
  damping: 34,
  stiffness: 380,
} as const;

function SelectOrganizationButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleButtonClick = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <button
        type="button"
        aria-expanded={isOpen}
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
      {/* 헤더 아래로만 보이게 잘라, 내려오는 동안 헤더를 덮지 않음 (아래 여백은 그림자 자리) */}
      <div className="pointer-events-none absolute top-full left-0 w-full overflow-hidden pb-16">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={PANEL_TRANSITION}
              className="bg-elevated pointer-events-auto flex w-full flex-col gap-4 rounded-b-2xl px-6 py-8 shadow-2xl"
            >
              <div className="text-lg font-medium">그룹을 선택해 주세요</div>
              <MyOrganizationList
                className="pb-2"
                onSelect={handleButtonClick}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default SelectOrganizationButton;
