
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
      
      // Save public content data before logout to preserve user experience
      const videosData = queryClient.getQueryData(["youtube_videos"]);
      const channelsData = queryClient.getQueryData(["youtube_channels"]);
      
      // Track if we had real content before logout
      const hasVideos = Array.isArray(videosData) && videosData.length > 0;
      const hasChannels = Array.isArray(channelsData) && channelsData.length > 0;
      
      // IMMEDIATE ACTION: Navigate to welcome page
      // This provides instant feedback that logout is happening
      navigate("/");
      
      // Clear all user-specific data from the query cache IMMEDIATELY
      queryClient.removeQueries({ queryKey: ["profile"] });
      queryClient.removeQueries({ queryKey: ["user-profile"] });
      queryClient.removeQueries({ queryKey: ["user-profile-settings"] });
      queryClient.removeQueries({ queryKey: ["admin-section-profile"] });
      queryClient.removeQueries({ queryKey: ["user-video-interactions"] });
      queryClient.removeQueries({ queryKey: ["video-notifications"] });
      queryClient.removeQueries({ queryKey: ["session"] });
      
      // Force session to null in any cache
      queryClient.setQueryData(["session"], null);
      
      // Restore public content data to prevent blank screen
      if (hasVideos && videosData) {
        queryClient.setQueryData(["youtube_videos"], videosData);
      }
      
      if (hasChannels && channelsData) {
        queryClient.setQueryData(["youtube_channels"], channelsData);
      }
      
      // Perform actual Supabase logout in background
      // Even if this is slow, the UI has already updated
      await supabase.auth.signOut();
      
    } catch (error) {
      console.error("Unexpected error during logout:", error);
      // Still navigate home even if there's an error
      navigate("/");
    } finally {
      setIsLoggingOut(false);
    }
  }, [navigate, queryClient, setIsLoggingOut]);

  return { signOut };
};
