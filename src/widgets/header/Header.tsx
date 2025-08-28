"use client";
import { memo } from "react";
import { ChevronLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { ROUTES } from "@/shared/config/routes";

interface HeaderProps {
  title?: string;
  withOrganizationButton?: boolean;
  withBackButton?: boolean;
  withSearchButton?: boolean;
  onBack?: () => void;
}

function Header({
  title,
  withOrganizationButton,
  withBackButton,
  withSearchButton,
  onBack,
}: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleSearch = () => {
    router.push(ROUTES.SEARCH);
  };

  return (
    <header className="sticky top-0 z-50 mb-1 flex h-14 min-h-14 w-full items-center justify-between bg-white px-5 py-3.5">
      <div className="flex items-center gap-2">
        {withBackButton && (
          <button className="cursor-pointer" onClick={handleBack}>
            <ChevronLeft className="stroke-dark" size={24} />
          </button>
        )}
        {withOrganizationButton && (
          <div className="text-primary text-xl font-semibold">별이네</div>
        )}
        {title && (
          <>
            <div className="text-light text-xl font-semibold">/</div>
            <div className="text-xl font-semibold">{title}</div>
          </>
        )}
      </div>
      <div>
        {withSearchButton && (
          <button onClick={handleSearch}>
            <Search className="stroke-dark stroke-[2.5]" size={24} />
          </button>
        )}
      </div>
    </header>
  );
}

export default memo(Header);
