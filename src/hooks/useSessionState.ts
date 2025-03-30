
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
    let isMounted = true;
    
    const initializeSession = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession && isMounted) {
          console.log("Initial session loaded, user ID:", initialSession.user.id);
          setSession(initialSession);
          
          // Pre-fetch profile data immediately if we have a session
          prefetchUserData(initialSession, queryClient)
            .then(success => {
              if (success) {
                console.log("Initial profile data prefetch complete");
              } else {
                console.warn("Initial profile data prefetch failed");
              }
            })
            .catch(error => console.error("Error prefetching user data:", error));
        }
        
        // Load remaining content in the background after profile
        setTimeout(() => {
          fetchInitialContent(queryClient)
            .catch(error => console.error("Error fetching initial content:", error));
        }, 100); // Slight delay to prioritize user data
        
        if (isMounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error initializing session:", error);
        if (isMounted) {
          setSession(null);
          setIsLoading(false);
        }
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Auth state changed:", event);
      
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && isMounted) {
        setSession(currentSession);
        
        // Immediately prefetch profile data
        if (currentSession?.user?.id) {
          // Use setTimeout to avoid auth recursion issues
          setTimeout(() => {
            prefetchUserData(currentSession, queryClient)
              .catch(err => console.error("Profile data prefetch error:", err));
          }, 0);
        }
      } else if (event === 'SIGNED_OUT' && isMounted) {
        setSession(null);
        // Clean up user data from cache
        queryClient.removeQueries({ queryKey: ["profile"] });
        queryClient.removeQueries({ queryKey: ["user-profile"] });
        queryClient.removeQueries({ queryKey: ["user-profile-settings"] });
        queryClient.removeQueries({ queryKey: ["user-profile-minimal"] });
      }
    });

    initializeSession();
    
    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [queryClient]);

  return { session, isLoading };
};
