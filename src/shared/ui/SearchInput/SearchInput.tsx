import { ComponentProps } from "react";
import { X } from "lucide-react";

interface SearchInputProps extends ComponentProps<"input"> {
  onXButtonClick?: () => void;
}

function SearchInput({ onXButtonClick, ...props }: SearchInputProps) {
  const handleXButtonClick = () => {
    onXButtonClick?.();
  };

  return (
    <div className="relative">
      <input
        className="border-light placeholder:text-dark w-full rounded-full border px-5 py-2.5 placeholder:text-sm"
        {...props}
      />
      {props.value && (
        <button
          className="absolute top-1/2 right-5 -translate-y-1/2 cursor-pointer"
          onClick={onXButtonClick}
        >
          <X className="stroke-dark h-4 w-4" onClick={handleXButtonClick} />
        </button>
      )}
    </div>
  );
}

export default SearchInput;
