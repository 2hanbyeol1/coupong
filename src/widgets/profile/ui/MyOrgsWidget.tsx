import { MyOrgsList } from "@/features/select-organization/ui/MyOrgsList";
import { cn } from "@/shared/lib/util/cn";

interface MyOrgsWidgetProps {
  className?: string;
  title: string;
  onSelect?: () => void;
}

function MyOrgsWidget({ className, title }: MyOrgsWidgetProps) {
  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <div className="text-xl font-medium">{title}</div>
      <MyOrgsList />
    </div>
  );
}

export default MyOrgsWidget;
