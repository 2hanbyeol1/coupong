import { Logo } from "@/shared/ui";
import { CenteredView } from "@/shared/ui/CenteredView";
import Skeleton from "@/shared/ui/Skeleton";

function InvitationLoadingPage() {
  return (
    <CenteredView className="max-w-60">
      <div className="flex flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-4">
          <Logo size={76} />

          <div className="flex flex-col items-center gap-2">
            <Skeleton textSize="2xl" className="w-48" />
            <Skeleton textSize="base" className="w-40" />
          </div>
        </div>

        <Skeleton className="h-10 w-24" />
      </div>
    </CenteredView>
  );
}

export default InvitationLoadingPage;
