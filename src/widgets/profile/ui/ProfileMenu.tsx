import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { Chip } from "@/shared/ui";

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
      <div className="flex items-center gap-3">
        <span className="text-lg font-medium">{menu}</span>
        {isTest && <Chip color="neutral">Beta</Chip>}
      </div>
      <ChevronRight className="stroke-dark" size={20} />
    </Link>
  );
}

export default ProfileMenu;
