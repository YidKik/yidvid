
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

  // Log session state for debugging
  useEffect(() => {
    console.log("SessionContext - session state:", !!session?.user);
  }, [session]);

  // Ensure content is preserved during auth state changes
  useEffect(() => {
    // Preserve content during auth state changes
    const restoreData = preserveContentData(queryClient);
    
    // When auth state changes, we invalidate queries but keep showing existing data
    const handleAuthChange = () => {
      // Mark queries as stale but DON'T remove them from cache yet
      queryClient.invalidateQueries({ 
        queryKey: ["youtube_videos"],
        refetchType: "none" // Don't trigger immediate refetch
      });
      
      queryClient.invalidateQueries({ 
        queryKey: ["youtube_channels"],
        refetchType: "none"
      });
      
      // Then schedule a delayed refetch to update with fresh data
      refreshContentAfterDelay(queryClient, 1000);
    };
    
    // Set up a special auth state change handler with setTimeout
    // to avoid RLS recursion issues
    if (session?.user?.id) {
      console.log("Session is active, setting up content preservation");
      setTimeout(handleAuthChange, 0);
    }
    
    return restoreData;
  }, [session?.user?.id, queryClient]);

  return (
    <SessionContext.Provider value={{ session, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
};
