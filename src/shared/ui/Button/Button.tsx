import { ComponentProps } from "react";
import { cva, VariantProps } from "class-variance-authority";
import Link from "next/link";

import { cn } from "@/shared/lib/cn";

type ButtonProps = VariantProps<typeof buttonVariants>;

const buttonVariants = cva(
  "bg-primary text-white flex items-center justify-center rounded-md",
  {
    variants: {
      size: {
        sm: "px-3.5 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
      },
      full: {
        true: "w-full",
      },
    },
  },
);

function Button({
  className,
  size = "md",
  children,
  full,
  ...props
}: ButtonProps & (ComponentProps<"button"> | ComponentProps<typeof Link>)) {
  if ("href" in props)
    return (
      <Link
        className={cn(buttonVariants({ size, full }), className)}
        {...props}
      >
        {children}
      </Link>
    );

  return (
    <button
      className={cn(
        buttonVariants({ size, full }),
        props.disabled ? "bg-primary/40 cursor-not-allowed" : "cursor-pointer",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
