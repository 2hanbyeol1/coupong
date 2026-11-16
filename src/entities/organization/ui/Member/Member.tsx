import { ReactNode } from "react";
import { Crown } from "lucide-react";

import { Avatar } from "@/entities/user/ui/Avatar";
import { Chip } from "@/shared/ui";

import { OrganizationRole } from "../../api/type";

interface MemberProps {
  userId: string;
  name: string;
  role: OrganizationRole;
  isMe?: boolean;
  /** 오른쪽 끝에 둘 버튼 (예: 관리 메뉴) */
  action?: ReactNode;
}

function Member({ userId, name, role, isMe, action }: MemberProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar userId={userId} size={28} />
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex min-w-0 items-center gap-1">
            <span className="truncate font-medium">{name}</span>
            {/* 관리자는 이름 바로 옆에 왕관 */}
            {role === "admin" && (
              <>
                <Crown
                  aria-hidden
                  className="size-4 shrink-0 fill-amber-400 stroke-amber-500"
                />
                <span className="sr-only">관리자</span>
              </>
            )}
          </span>
          {isMe && <Chip color="neutral">나</Chip>}
        </div>
      </div>
      {action}
    </div>
  );
}

export default Member;
