
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthBase } from "./useAuthBase";

export const useAuthSignOut = () => {
  const {
    navigate,
    queryClient,
    setIsLoggingOut,
  } = useAuthBase();

  const signOut = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      
      // Cancel all in-flight queries immediately
      queryClient.cancelQueries();
      
      // Save important content data before logout
      const videosData = queryClient.getQueryData(["youtube_videos"]);
      const channelsData = queryClient.getQueryData(["youtube_channels"]);
      
      // Track if we had real content before logout
      const hasVideos = Array.isArray(videosData) && videosData.length > 0;
      const hasChannels = Array.isArray(channelsData) && channelsData.length > 0;
      
      console.log(`Before logout: Cancelling queries and proceeding with immediate logout`);
      
      // Set a timeout to navigate even if supabase is slow
      const timeoutId = setTimeout(() => {
        console.log("Logout taking too long - forcing navigation");
        navigate("/");
        toast.success("Logged out successfully");
      }, 1000); // Wait max 1 second before forcing navigation
      
      // Start the signOut process
      const { error } = await supabase.auth.signOut();
      
      // Clear the timeout since we got a response
      clearTimeout(timeoutId);
      
      if (error) {
        console.error("Error during logout:", error);
        toast.error("Error during logout: " + error.message);
        return;
      }
      
      // Clear user-specific queries
      queryClient.removeQueries({ queryKey: ["profile"] });
      queryClient.removeQueries({ queryKey: ["user-profile"] });
      queryClient.removeQueries({ queryKey: ["user-video-interactions"] });
      
      // Restore content data immediately to prevent blank screen
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
