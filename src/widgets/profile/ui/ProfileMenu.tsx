import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface ProfileMenuProps {
  menu: string;
  link: string;
  isTest?: boolean;
}

function ProfileMenu({ menu, link, isTest }: ProfileMenuProps) {
  return (
    <Link
      href={link}
      className="hover:bg-light/40 flex items-center justify-between px-2 py-2"
    >
      <div className="flex items-center gap-4">
        <span className="text-lg font-medium">{menu}</span>
        {isTest && (
          <span className="bg-dark rounded-md px-2 py-1 text-xs text-white">
            테스트 중
          </span>
        )}
      </div>
      <ChevronRight className="stroke-dark" size={20} />
    </Link>
  );
}

export default ProfileMenu;
