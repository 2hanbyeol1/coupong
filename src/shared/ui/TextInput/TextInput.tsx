import { ComponentProps, useId } from "react";

function TextInput({ placeholder, ...props }: ComponentProps<"input">) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-dark text-sm">
        {placeholder}
      </label>
      <input
        id={id}
        type="text"
        className="ring-light focus:ring-primary rounded-md px-4 py-2 ring-1 focus:ring-2"
        {...props}
      />
    </div>
  );
}

export default TextInput;
