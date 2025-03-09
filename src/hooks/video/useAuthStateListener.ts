
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to listen for auth state changes and trigger actions
 */
export const useAuthStateListener = (
  setAuthState: (authState: string) => void
) => {
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      console.log("Auth state changed in useVideos:", event);
      
      // Update auth state based on event
      setAuthState(event);
      
      if (event === 'SIGNED_IN') {
        console.log("User signed in, auth state updated");
      }
      
      if (event === 'SIGNED_OUT') {
        console.log("User signed out, auth state updated");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [setAuthState]);

  return { authStateListenerActive: true };
};
