
import { createContext, useContext, ReactNode, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useSessionState } from "@/hooks/useSessionState";
import { preserveContentData, refreshContentAfterDelay } from "@/utils/queryPreservation";

type SessionContextType = {
  session: Session | null;
  isLoading: boolean;
};

const SessionContext = createContext<SessionContextType>({
  session: null,
  isLoading: true,
});

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const { session, isLoading } = useSessionState(queryClient);

  // Ensure content is preserved during auth state changes
  useEffect(() => {
    const restoreData = preserveContentData(queryClient);
    
    // Refresh content data after a short delay to ensure user has access
    // to the latest data after authentication state changes
    refreshContentAfterDelay(queryClient, 1000);
    
    return restoreData;
  }, [session?.user?.id, queryClient]);

  return (
    <SessionContext.Provider value={{ session, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
};
