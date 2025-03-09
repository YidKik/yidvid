
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to listen for auth state changes and trigger actions
 */
export const useAuthStateListener = (
  forceRefetch: () => Promise<any>
) => {
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      console.log("Auth state changed in useVideos:", event);
      
      if (event === 'SIGNED_IN') {
        console.log("User signed in, triggering video refetch");
        setTimeout(() => {
          forceRefetch().catch(err => {
            console.error("Error force refetching after sign in:", err);
          });
        }, 1000); // Small delay to ensure auth is complete
      }
      
      if (event === 'SIGNED_OUT') {
        console.log("User signed out, triggering video refetch");
        setTimeout(() => {
          forceRefetch().catch(err => {
            console.error("Error force refetching after sign out:", err);
          });
        }, 1000); // Small delay to ensure auth is complete
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [forceRefetch]);

  return { authStateListenerActive: true };
};
