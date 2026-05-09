"use client";
import {
  ChangeEvent,
  ComponentProps,
  forwardRef,
  ReactNode,
  useId,
} from "react";
import { Check } from "lucide-react";

import { cn } from "@/shared/lib/util/cn";

interface CheckboxProps extends Omit<
  ComponentProps<"input">,
  "type" | "onChange"
> {
  children?: ReactNode;
  className?: string;
  onChange?: (isChecked: boolean) => void;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ children, className, onChange, id, checked, ...props }, ref) => {
    const reactId = useId();
    const inputId = id ?? reactId;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    };

    return (
      <label
        htmlFor={inputId}
        className={cn(
          "flex cursor-pointer items-center gap-2 text-sm select-none",
          className,
        )}
      >
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          className="peer sr-only"
          {...props}
        />
        <span
          aria-hidden="true"
          className={cn(
            "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border-2 transition-colors",
            "peer-focus-visible:ring-primary peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2",
            checked ? "border-primary bg-primary" : "border-light bg-white",
          )}
        >
          <Check
            size={14}
            strokeWidth={3}
            className={cn(
              "text-white transition-opacity",
              checked ? "opacity-100" : "opacity-0",
            )}
          />
        </span>
        {children && <span className="text-dark">{children}</span>}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
