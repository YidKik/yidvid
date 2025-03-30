
import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { prefetchUserData } from "@/utils/userDataPrefetch";
import { fetchInitialContent } from "@/utils/contentFetching";

export const useSessionState = (queryClient: QueryClient) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession) {
          console.log("Initial session loaded, fetching profile data");
          setSession(initialSession);
          
          // Pre-fetch profile data immediately if we have a session
          await prefetchUserData(initialSession, queryClient);
        }
        
        // Load remaining content in the background after profile
        setTimeout(() => {
          fetchInitialContent(queryClient).catch(console.error);
        }, 0);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing session:", error);
        setSession(null);
        setIsLoading(false);
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(currentSession);
        
        // Immediately prefetch profile data
        if (currentSession?.user?.id) {
          // Use setTimeout to avoid auth recursion issues
          setTimeout(() => {
            prefetchUserData(currentSession, queryClient)
              .catch(err => console.error("Profile data prefetch error:", err));
          }, 0);
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        queryClient.removeQueries({ queryKey: ["profile"] });
        queryClient.removeQueries({ queryKey: ["user-profile"] });
        queryClient.removeQueries({ queryKey: ["user-profile-settings"] });
      }
    });

    initializeSession();
    
    return () => subscription?.unsubscribe();
  }, [queryClient]);

  return { session, isLoading };
};
