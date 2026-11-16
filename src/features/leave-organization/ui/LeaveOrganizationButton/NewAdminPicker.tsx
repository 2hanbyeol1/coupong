"use client";
import { useState } from "react";
import { Check } from "lucide-react";

import { OrganizationMemberType } from "@/entities/organization/api/type";
import { Avatar } from "@/entities/user/ui/Avatar";
import { cn } from "@/shared/lib/util/cn";

export type NewAdminCandidate = OrganizationMemberType & {
  user: { name: string } | null;
};

interface NewAdminPickerProps {
  /** 먼저 들어온 순으로 정렬된 그룹원 (첫 번째가 기본 선택) */
  candidates: NewAdminCandidate[];
  onChange: (memberId: NewAdminCandidate["id"]) => void;
}

/** 마지막 관리자가 나가기 전에 새 관리자를 고르는 목록 */
function NewAdminPicker({ candidates, onChange }: NewAdminPickerProps) {
  const [selectedId, setSelectedId] = useState(candidates[0]?.id);

  const handleChange = (memberId: NewAdminCandidate["id"]) => {
    setSelectedId(memberId);
    onChange(memberId);
  };

  return (
    <div
      role="radiogroup"
      aria-label="새 관리자"
      className="-mx-2 flex max-h-60 flex-col gap-0.5 overflow-y-auto text-left"
    >
      {candidates.map((member) => {
        const isSelected = member.id === selectedId;
        return (
          <label
            key={member.id}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-black/20",
              isSelected && "bg-primary/8",
            )}
          >
            <input
              type="radio"
              name="new-admin"
              value={member.id}
              checked={isSelected}
              onChange={() => handleChange(member.id)}
              className="sr-only"
            />
            <Avatar userId={member.user_id} size={28} />
            <span
              className={cn(
                "min-w-0 flex-1 truncate font-medium text-black",
                isSelected && "text-primary font-semibold",
              )}
            >
              {member.user?.name ?? "이름 없음"}
            </span>
            <span
              aria-hidden
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full",
                isSelected ? "bg-primary" : "bg-light",
              )}
            >
              {isSelected && (
                <Check className="stroke-light stroke-4" size={12} />
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export default NewAdminPicker;
