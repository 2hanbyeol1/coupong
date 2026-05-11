"use client";
import { PropsWithChildren, useEffect } from "react";

import { useOrganizationStore } from "@/entities/organization/model/store";
import createClient from "@/shared/lib/supabase/client";

function AuthStateProvider({ children }: PropsWithChildren) {
  const resetSelectedOrganization = useOrganizationStore(
    (state) => state.resetSelectedOrganization,
  );

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || (event === "INITIAL_SESSION" && !session)) {
        resetSelectedOrganization();
      }
    });

    return () => subscription.unsubscribe();
  }, [resetSelectedOrganization]);

  return <>{children}</>;
}

export default AuthStateProvider;
