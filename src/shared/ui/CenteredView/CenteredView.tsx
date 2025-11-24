import { PropsWithChildren } from "react";

import { cn } from "@/shared/lib/util/cn";

interface CenteredViewProps extends PropsWithChildren {
  className?: string;
  withHeader?: boolean;
}

function CenteredView({ className, children, withHeader }: CenteredViewProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col items-center justify-center",
        // header size = 48px
        withHeader ? "h-[calc(100dvh-48px)]" : "h-dvh",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default CenteredView;
