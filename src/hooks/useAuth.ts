
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/contexts/SessionContext";

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Save important content data before logout
      const videosData = queryClient.getQueryData(["youtube_videos"]);
      const channelsData = queryClient.getQueryData(["youtube_channels"]);
      
      // Track if we had real content before logout (improved check)
      const hasVideos = Array.isArray(videosData) && videosData.length > 0;
      const hasChannels = Array.isArray(channelsData) && channelsData.length > 0;
      
      console.log(`Before logout: Has videos: ${hasVideos ? 'Yes' : 'No'}, Has channels: ${hasChannels ? 'Yes' : 'No'}`);
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error during logout:", error);
        toast.error("Error during logout: " + error.message);
        setIsLoggingOut(false);
        return;
      }
      
      // First invalidate only user-specific queries to avoid unnecessary fetches
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user-video-interactions"] });
      
      // Restore videos and channels data immediately to prevent blank screen
      if (hasVideos && videosData) {
        console.log("Restoring videos data after logout", videosData.length);
        queryClient.setQueryData(["youtube_videos"], videosData);
      }
      
      if (hasChannels && channelsData) {
        console.log("Restoring channels data after logout", channelsData.length);
        queryClient.setQueryData(["youtube_channels"], channelsData);
      }
      
      // If we didn't have data before, trigger a fresh fetch immediately
      if (!hasVideos) {
        console.log("No videos to restore, invalidating to trigger fetch");
        queryClient.invalidateQueries({ queryKey: ["youtube_videos"] });
      }
      
      if (!hasChannels) {
        console.log("No channels to restore, invalidating to trigger fetch");
        queryClient.invalidateQueries({ queryKey: ["youtube_channels"] });
      }
      
      // Always navigate to the home page after logout, regardless of where logout was triggered
      navigate("/");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Unexpected error during logout:", error);
      toast.error("Unexpected error during logout");
      navigate("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return {
    session,
    isAuthenticated: !!session,
    handleLogout,
    isLoggingOut
  };
};
