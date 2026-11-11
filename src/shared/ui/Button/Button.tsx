import { ComponentProps } from "react";
import { cva, VariantProps } from "class-variance-authority";
import Link from "next/link";

import { cn } from "@/shared/lib/util/cn";

type ButtonProps = VariantProps<typeof buttonVariants>;

/**
 * size 계층
 * - lg (48px): 화면·모달 하단의 주요 CTA
 * - md (40px): 패널·폼 안의 일반 액션
 * - sm (32px): 리스트·카드 안의 보조/컴팩트 액션
 */
const buttonVariants = cva(
  "flex items-center justify-center font-semibold whitespace-nowrap",
  {
    variants: {
      color: {
        primary: "bg-primary text-white",
        light: "bg-light text-black",
      },
      size: {
        sm: "h-8 gap-1 rounded-md px-3 text-sm",
        md: "h-10 gap-1.5 rounded-lg px-4 text-[15px]",
        lg: "h-12 gap-2 rounded-xl px-5 text-base",
      },
      full: {
        true: "w-full",
      },
    },
    defaultVariants: {
      color: "primary",
      size: "md",
    },
  },
);

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
      type={props.type ?? "button"}
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
