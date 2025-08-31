import { PropsWithChildren } from "react";
import { cva, VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/util/cn";

interface SkeletonProps
  extends PropsWithChildren,
    VariantProps<typeof skeletonVariants> {
  className: string;
  wrapper?: boolean;
}

const skeletonVariants = cva("rounded-md", {
  variants: {
    textSize: {
      none: "",
      xs: "h-[12px] my-[2px]",
      sm: "h-[14px] my-[3px]",
      base: "h-[16px] my-[4px]",
      lg: "h-[18px] my-[5px]",
      xl: "h-[20px] my-[4px]",
      "3xl": "h-[30px] my-[3px]",
    },
  },
  defaultVariants: {
    textSize: "none",
  },
});

function Skeleton({ className, children, wrapper, textSize }: SkeletonProps) {
  return (
    <div
      className={cn(
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
