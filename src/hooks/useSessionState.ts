
import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { prefetchUserData } from "@/utils/userDataPrefetch";
import { fetchInitialContent } from "@/utils/contentFetching";
import { preserveContentData, refreshContentAfterDelay } from "@/utils/queryPreservation";

export const useSessionState = (queryClient: QueryClient) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setIsLoading(false);
          return;
        }

        if (initialSession) {
          console.log("Initial session loaded:", initialSession.user?.email);
          setSession(initialSession);
          
          // Pre-fetch profile data if we have a session
          prefetchUserData(initialSession, queryClient);
        } else {
          console.log("No initial session found");
        }
        
        // Always fetch content data regardless of session status
        fetchInitialContent(queryClient);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing session:", error);
        setSession(null);
        setIsLoading(false);
        
        // Even if there's an error, try to load content
        fetchInitialContent(queryClient);
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state changed:", event);
      
      // Preserve content data before auth changes
      const restoreContent = preserveContentData(queryClient);
      
      switch (event) {
        case 'SIGNED_IN':
          setSession(currentSession);
          
          // Only invalidate user-specific queries
          queryClient.invalidateQueries({ queryKey: ["profile"] });
          queryClient.invalidateQueries({ queryKey: ["user-profile"] });
          
          // Fetch new profile data
          if (currentSession?.user?.id) {
            prefetchUserData(currentSession, queryClient);
          }
          
          // Restore content data to ensure it's not lost during sign in
          restoreContent();
          
          // Refresh content after a short delay
          refreshContentAfterDelay(queryClient);
          break;
          
        case 'TOKEN_REFRESHED':
          setSession(currentSession);
          break;
          
        case 'SIGNED_OUT':
          setSession(null);
          
          // Only invalidate user-specific queries, not content
          queryClient.invalidateQueries({ queryKey: ["profile"] });
          queryClient.invalidateQueries({ queryKey: ["user-profile"] });
          queryClient.invalidateQueries({ queryKey: ["user-video-interactions"] });
          
          // Restore content data
          restoreContent();
          
          // Force a refresh of content data after sign out with a delay
          refreshContentAfterDelay(queryClient);
          break;
          
        case 'USER_UPDATED':
          setSession(currentSession);
          
          // Invalidate profile query after user update
          if (currentSession?.user?.id) {
            queryClient.invalidateQueries({ queryKey: ["profile", currentSession.user.id] });
            queryClient.invalidateQueries({ queryKey: ["user-profile"] });
          }
          break;
      }
    });

    initializeSession();
    
    return () => subscription?.unsubscribe();
  }, [queryClient]);

  return { session, isLoading };
};
