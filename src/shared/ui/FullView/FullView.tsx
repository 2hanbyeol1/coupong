import { PropsWithChildren } from "react";

import { cn } from "@/shared/lib/util/cn";

interface FullViewProps extends PropsWithChildren {
  className?: string;
  withHeader?: boolean;
}

function FullView({ className, children, withHeader }: FullViewProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col",
        // header size = 60px
        withHeader ? "h-[calc(100dvh-60px)]" : "h-dvh",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default FullView;
