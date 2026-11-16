import { ReactNode } from "react";

import { Avatar } from "@/entities/user/ui/Avatar";

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
        <span className="truncate font-medium">{name}</span>
        {isMe && <span className="text-dark shrink-0 text-sm">나</span>}
        {role === "admin" && (
          <span className="bg-primary/5 text-primary shrink-0 rounded-sm px-1.5 py-0.5 text-xs font-medium">
            관리자
          </span>
        )}
      </div>
      {action}
    </div>
  );
}

export default Member;
