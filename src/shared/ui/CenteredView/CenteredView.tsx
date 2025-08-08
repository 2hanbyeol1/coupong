import { PropsWithChildren } from "react";

import { cn } from "@/shared/lib/cn";

interface CenteredViewProps extends PropsWithChildren {
  className?: string;
}

function CenteredView({ className, children }: CenteredViewProps) {
  return (
    <div
      className={cn(
        "mx-auto flex h-screen w-full flex-col items-center justify-center",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default CenteredView;
