
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthBase } from "./useAuthBase";

/**
 * Hook that handles user sign-out functionality
 * Depends on useAuthBase for shared authentication state
 */
export const useAuthSignOut = () => {
  const {
    navigate,
    queryClient,
    setIsLoggingOut,
  } = useAuthBase();

  /**
   * Handles user sign-out process with immediate feedback and fast navigation
   */
  const signOut = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      
      // Cancel all in-flight queries immediately
      queryClient.cancelQueries();
      
      // Clear all user-specific data from the query cache
      queryClient.removeQueries({ queryKey: ["profile"] });
      queryClient.removeQueries({ queryKey: ["user-profile"] });
      queryClient.removeQueries({ queryKey: ["user-profile-settings"] });
      queryClient.removeQueries({ queryKey: ["admin-section-profile"] });
      queryClient.removeQueries({ queryKey: ["user-video-interactions"] });
      queryClient.removeQueries({ queryKey: ["video-notifications"] });
      queryClient.removeQueries({ queryKey: ["session"] });
      queryClient.setQueryData(["session"], null);
      
      // Perform actual Supabase logout
      await supabase.auth.signOut();
      
      // Hard redirect to /videos to fully reset app state and avoid blank screen
      window.location.href = "/videos";
      
    } catch (error) {
      console.error("Unexpected error during logout:", error);
      // Force redirect even on error
      window.location.href = "/videos";
    } finally {
      setIsLoggingOut(false);
    }
  }, [queryClient, setIsLoggingOut]);

  return { signOut };
};
