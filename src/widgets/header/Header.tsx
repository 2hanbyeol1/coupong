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
    } else if (window.history.length > 1) {
      router.back();
    } else {
      // 알림 등으로 이 화면부터 열려 돌아갈 기록이 없으면 홈으로
      router.replace(ROUTES.HOME);
    }
  };

  const handleSearch = () => {
    router.push(ROUTES.SEARCH());
  };

  return (
    <header className="bg-surface sticky top-0 z-50 flex h-12 min-h-12 w-full items-center justify-between px-4 py-1">
      <div className={cn("flex items-center gap-2", withBackButton && "-ml-2")}>
        {withBackButton && (
          <button
            type="button"
            aria-label="뒤로 가기"
            className="cursor-pointer"
            onClick={handleBack}
          >
            <ChevronLeft className="stroke-dark" size={28} />
          </button>
        )}
        {withOrganizationButton && <SelectOrganizationButton />}
        {withOrganizationButton && title && (
          <div className="text-light text-xl font-semibold">/</div>
        )}
        {title && <div className="text-xl font-semibold">{title}</div>}
      </div>
      <div className="flex items-center gap-4">
        {withSearchButton && (
          <button
            type="button"
            aria-label="검색"
            onClick={handleSearch}
            className="cursor-pointer"
          >
            <Search className="stroke-dark/90 stroke-[2.5]" size={24} />
          </button>
        )}
        <Link href={ROUTES.PROFILE} aria-label="내 프로필">
          <Avatar size={28} />
        </Link>
      </div>
    </header>
  );
}

export default memo(Header);
