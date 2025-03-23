
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
   * Handles user sign-out process with optimizations for speed and reliability
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
      
      // Navigate to welcome page immediately for instant feedback
      // This makes logout feel instant to the user
      navigate("/");
      
      // Clear all user specific data from the query cache
      queryClient.removeQueries({ queryKey: ["profile"] });
      queryClient.removeQueries({ queryKey: ["user-profile"] });
      queryClient.removeQueries({ queryKey: ["user-profile-settings"] });
      queryClient.removeQueries({ queryKey: ["admin-section-profile"] });
      queryClient.removeQueries({ queryKey: ["user-video-interactions"] });
      queryClient.removeQueries({ queryKey: ["video-notifications"] });
      
      // Restore public content data to prevent blank screen
      if (hasVideos && videosData) {
        queryClient.setQueryData(["youtube_videos"], videosData);
      }
      
      if (hasChannels && channelsData) {
        queryClient.setQueryData(["youtube_channels"], channelsData);
      }
      
      // Show success message immediately
      toast.success("Logged out successfully");
      
      // Now perform the actual Supabase logout in the background
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error during logout:", error);
        // Don't show error toast since we've already navigated away
      }
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
