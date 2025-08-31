"use client";
import { memo } from "react";
import { ChevronLeft, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Avatar } from "@/entities/user/ui/Avatar";
import { SelectOrgButton } from "@/features/select-organization/ui/SelectOrgButton";
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
          <button className="mr-1 cursor-pointer" onClick={handleBack}>
            <ChevronLeft className="stroke-dark" size={24} />
          </button>
        )}
        {withOrganizationButton && <SelectOrgButton />}
        {title && (
          <>
            <div className="text-light text-xl font-semibold">/</div>
            <div className="text-xl font-semibold">{title}</div>
          </>
        )}
      </div>
      <div className="flex items-center gap-4">
        {withSearchButton && (
          <button onClick={handleSearch} className="cursor-pointer">
            <Search className="stroke-dark stroke-[2.5]" size={24} />
          </button>
        )}
        <Link href={ROUTES.PROFILE}>
          <Avatar />
        </Link>
      </div>
    </header>
  );
}

export default memo(Header);
