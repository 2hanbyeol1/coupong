"use client";
import { memo } from "react";
import { ChevronLeft, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Avatar } from "@/entities/user/ui/Avatar";
import { SelectOrganizationButton } from "@/features/select-organization/ui/SelectOrganizationButton";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/util/cn";

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
    <header className="sticky top-0 z-50 flex h-12 min-h-12 w-full items-center justify-between bg-white px-4 py-1">
      <div className={cn("flex items-center gap-2", withBackButton && "-ml-2")}>
        {withBackButton && (
          <button className="cursor-pointer" onClick={handleBack}>
            <ChevronLeft className="stroke-dark" size={28} />
          </button>
        )}
        {withOrganizationButton && <SelectOrganizationButton />}
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
            <Search className="stroke-dark/90 stroke-[2.5]" size={24} />
          </button>
        )}
        <Link href={ROUTES.PROFILE}>
          <Avatar size={28} />
        </Link>
      </div>
    </header>
  );
}

export default memo(Header);
