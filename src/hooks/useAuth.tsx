
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
      
      // Track if we had real content before logout
      const hadRealVideos = Array.isArray(videosData) && videosData.length > 0;
      const hadRealChannels = Array.isArray(channelsData) && channelsData.length > 0;
      
      console.log(`Before logout: Had ${videosData ? 'video data' : 'NO video data'}, Had ${channelsData ? 'channel data' : 'NO channel data'}`);
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error during logout:", error);
        toast.error("Error during logout: " + error.message);
        setIsLoggingOut(false);
        return;
      }
      
      // First invalidate only user-specific queries
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user-video-interactions"] });
      
      // Then restore content data if it existed
      if (hadRealVideos && videosData) {
        console.log("Restoring videos data after logout", Array.isArray(videosData) ? videosData.length : 0);
        queryClient.setQueryData(["youtube_videos"], videosData);
      } else {
        // If we didn't have data, invalidate to trigger a fresh fetch
        console.log("No videos to restore, invalidating to trigger fetch");
        queryClient.invalidateQueries({ queryKey: ["youtube_videos"] });
      }
      
      if (hadRealChannels && channelsData) {
        console.log("Restoring channels data after logout", Array.isArray(channelsData) ? channelsData.length : 0);
        queryClient.setQueryData(["youtube_channels"], channelsData);
      } else {
        // If we didn't have data, invalidate to trigger a fresh fetch
        console.log("No channels to restore, invalidating to trigger fetch");
        queryClient.invalidateQueries({ queryKey: ["youtube_channels"] });
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
  };

  return {
    session,
    isAuthenticated: !!session,
    handleLogout,
    isLoggingOut
  };
};
