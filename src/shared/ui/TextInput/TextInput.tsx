import { ComponentProps, forwardRef, useId } from "react";

interface TextInputProps extends ComponentProps<"input"> {
  errorMessage?: string;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ placeholder, errorMessage, required, ...props }, ref) => {
    const id = useId();

    return (
      <div>
        <div className="flex flex-col gap-1">
          <label htmlFor={id} className="text-dark text-sm">
            {placeholder}
            {required && <span className="text-error"> *</span>}
          </label>
          <input
            id={id}
            ref={ref}
            type="text"
            className="ring-light focus:ring-primary rounded-md px-4 py-2 text-black ring-1 focus:ring-2"
            {...props}
          />
        </div>
        <div className="text-error mt-1">{errorMessage}</div>
      </div>
    );
  },
);

TextInput.displayName = "TextInput";

export default TextInput;
