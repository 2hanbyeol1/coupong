import { memo } from "react";
import { Search } from "lucide-react";

interface HeaderProps {
  title: string;
}

function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 mb-1 flex items-center justify-between bg-white px-5 py-3.5">
      <div className="flex items-center gap-2">
        <div className="text-primary text-xl font-semibold">별이네</div>
        <div className="text-light text-xl font-semibold">/</div>
        <div className="text-xl font-semibold">{title}</div>
      </div>
      <Search className="stroke-dark stroke-[2.5]" size={24} />
    </header>
  );
}

export default memo(Header);
