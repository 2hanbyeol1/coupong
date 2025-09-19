import { Plus } from "lucide-react";
import Link from "next/link";

import { cn } from "@/shared/lib/util/cn";

interface AddOrganizationButtonProps {
  className?: string;
}
function AddOrganizationButton({ className }: AddOrganizationButtonProps) {
  // !
  return null;

  return (
    <Link href={""} className={cn("flex items-center gap-1", className)}>
      <Plus className="stroke-primary stroke-3" size={14} />
      <span className="text-primary text-sm font-medium">새 그룹 만들기</span>
    </Link>
  );
}

export default AddOrganizationButton;
