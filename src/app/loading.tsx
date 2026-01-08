import { LoaderCircle } from "lucide-react";

import { CenteredView } from "@/shared/ui/CenteredView";

function Loading() {
  return (
    <CenteredView>
      <LoaderCircle className="stroke-primary size-10 animate-spin" />
    </CenteredView>
  );
}

export default Loading;
