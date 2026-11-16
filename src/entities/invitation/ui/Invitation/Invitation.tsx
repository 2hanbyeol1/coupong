import { ReactNode } from "react";
import { Mail } from "lucide-react";

import { getInvitationExpiryText } from "../../lib/util";

interface InvitationProps {
  email: string;
  inviterName: string;
  createdAt: string;
  /** 오른쪽 끝에 둘 버튼 (예: 초대 취소) */
  action?: ReactNode;
}

function Invitation({
  email,
  inviterName,
  createdAt,
  action,
}: InvitationProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="flex min-w-0 items-center gap-3">
        <div className="bg-light flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
          <Mail className="stroke-dark" size={14} />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-medium">{email}</span>
          <span className="text-dark truncate text-xs">
            {inviterName}님이 초대 · {getInvitationExpiryText(createdAt)}
          </span>
        </div>
      </div>
      {action}
    </div>
  );
}

export default Invitation;
