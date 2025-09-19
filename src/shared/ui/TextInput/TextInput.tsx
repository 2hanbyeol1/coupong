import { ComponentProps, useId } from "react";

interface TextInputProps extends ComponentProps<"input"> {
  errorMessage?: string;
}

function TextInput({ placeholder, errorMessage, ...props }: TextInputProps) {
  const id = useId();

  return (
    <div>
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="text-dark text-sm">
          {placeholder}
        </label>
        <input
          id={id}
          type="text"
          className="ring-light focus:ring-primary rounded-md px-4 py-2 text-black ring-1 focus:ring-2"
          {...props}
        />
      </div>
      <div className="text-error mt-1">{errorMessage}</div>
    </div>
  );
}

export default TextInput;
