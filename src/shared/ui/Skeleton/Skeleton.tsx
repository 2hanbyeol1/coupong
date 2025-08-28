import { PropsWithChildren } from "react";
import { cva, VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/util/cn";

interface SkeletonProps
  extends PropsWithChildren,
    VariantProps<typeof skeletonVariants> {
  className: string;
  wrapper?: boolean;
}

const skeletonVariants = cva("", {
  variants: {
    textSize: {
      xs: "h-[12px] my-[2px]",
      sm: "h-[14px] my-[3px]",
      base: "h-[16px] my-[4px]",
      lg: "h-[18px] my-[5px]",
    },
    defaultVariants: {
      textSize: "base",
    },
  },
});

function Skeleton({ className, children, wrapper, textSize }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md",
        skeletonVariants({ textSize }),
        wrapper ? "animate-skeleton bg-dark/20" : "bg-dark/20",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default Skeleton;
