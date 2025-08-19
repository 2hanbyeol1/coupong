import { ComponentProps } from "react";
import { cva, VariantProps } from "class-variance-authority";
import Link from "next/link";

import { cn } from "@/shared/lib/util/cn";

type ButtonProps = VariantProps<typeof buttonVariants>;

const buttonVariants = cva("flex items-center justify-center rounded-md", {
  variants: {
    color: {
      primary: "bg-primary text-white",
      light: "bg-light text-black",
    },
    size: {
      sm: "px-3.5 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-4 py-3 text-lg",
    },
    full: {
      true: "w-full",
    },
  },
  defaultVariants: {
    color: "primary",
    size: "md",
  },
});

function Button({
  className,
  color,
  size,
  full,
  children,
  ...props
}: ButtonProps & (ComponentProps<"button"> | ComponentProps<typeof Link>)) {
  if ("href" in props)
    return (
      <Link
        className={cn(buttonVariants({ color, size, full }), className)}
        {...props}
      >
        {children}
      </Link>
    );

  return (
    <button
      className={cn(
        buttonVariants({ color, size, full }),
        props.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
