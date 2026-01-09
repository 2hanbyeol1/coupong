import { ChangeEvent, ComponentProps } from "react";

interface ToggleButtonProps extends Omit<ComponentProps<"input">, "onChange"> {
  onChange?: (isChecked: boolean) => void;
}

function ToggleButton({ onChange, ...props }: ToggleButtonProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked);
  };

  return (
    <label className="inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        value=""
        className="peer sr-only"
        onChange={handleChange}
        {...props}
      />
      <div className="bg-dark/40 peer peer-checked:after:border-buffer peer-checked:bg-primary relative h-5 w-9 rounded-full peer-focus:outline-none after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full"></div>
    </label>
  );
}

export default ToggleButton;
