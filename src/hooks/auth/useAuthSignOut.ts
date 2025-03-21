
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
   * Uses multiple techniques to ensure the UI remains responsive even when
   * Supabase auth operations are slow
   */
  const signOut = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      
      // Cancel all in-flight queries immediately to prevent stale data
      queryClient.cancelQueries();
      
      // Save important content data before logout to preserve user experience
      const videosData = queryClient.getQueryData(["youtube_videos"]);
      const channelsData = queryClient.getQueryData(["youtube_channels"]);
      
      // Track if we had real content before logout to decide what to restore
      const hasVideos = Array.isArray(videosData) && videosData.length > 0;
      const hasChannels = Array.isArray(channelsData) && channelsData.length > 0;
      
      console.log(`Before logout: Cancelling queries and proceeding with immediate logout`);
      
      // Set a timeout to navigate even if supabase is slow
      // This is crucial for perceived performance - don't make users wait
      const timeoutId = setTimeout(() => {
        console.log("Logout taking too long - forcing navigation");
        navigate("/");
        toast.success("Logged out successfully");
      }, 1000); // Wait max 1 second before forcing navigation
      
      // Start the signOut process with Supabase
      const { error } = await supabase.auth.signOut();
      
      // Clear the timeout since we got a response
      clearTimeout(timeoutId);
      
      if (error) {
        console.error("Error during logout:", error);
        toast.error("Error during logout: " + error.message);
        return;
      }
      
      // Clear user-specific queries from cache
      // This prevents potential data leaks between users
      queryClient.removeQueries({ queryKey: ["profile"] });
      queryClient.removeQueries({ queryKey: ["user-profile"] });
      queryClient.removeQueries({ queryKey: ["user-video-interactions"] });
      
      // Restore public content data immediately to prevent blank screen
      // This significantly improves UX after logout
      if (hasVideos && videosData) {
        console.log("Restoring videos data after logout");
        queryClient.setQueryData(["youtube_videos"], videosData);
      }
      
      if (hasChannels && channelsData) {
        console.log("Restoring channels data after logout");
        queryClient.setQueryData(["youtube_channels"], channelsData);
      }
      
      navigate("/");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Unexpected error during logout:", error);
      toast.error("Unexpected error during logout");
      navigate("/");
    } finally {
      setIsLoggingOut(false);
    }
  }, [navigate, queryClient, setIsLoggingOut]);

  return { signOut };
};
