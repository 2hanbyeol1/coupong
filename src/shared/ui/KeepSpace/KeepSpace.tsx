import { ReactNode } from "react";

import { cn } from "@/shared/lib/util/cn";

interface KeepSpaceProps {
  /** false면 보이지 않지만 자리는 그대로 차지 */
  visible: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * 보이거나 숨겨도 높이가 같은 영역
 * 바꿀 때마다 아래 내용이 밀려 화면이 덜컹이지 않도록, 숨길 때도 자리는 남김
 * 숨긴 동안에는 누르거나 포커스할 수 없고 화면 읽기 프로그램에도 읽히지 않음
 */
function KeepSpace({ visible, children, className }: KeepSpaceProps) {
  return (
    <div
      aria-hidden={!visible}
      inert={!visible}
      className={cn(!visible && "invisible", className)}
    >
      {children}
    </div>
  );
}

export default KeepSpace;
