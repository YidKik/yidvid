
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
      
      // IMPORTANT: Capture existing content data before logout
      const videosData = queryClient.getQueryData(["youtube_videos"]);
      const channelsData = queryClient.getQueryData(["youtube_channels"]);
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error during logout:", error);
        toast.error("Error during logout: " + error.message);
        setIsLoggingOut(false);
        return;
      }
      
      // Only invalidate user-specific queries, not content
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user-video-interactions"] });
      
      // IMPORTANT: Restore content data
      if (videosData) {
        console.log("Restoring videos data after logout");
        queryClient.setQueryData(["youtube_videos"], videosData);
      }
      
      if (channelsData) {
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
  };

  return {
    session,
    isAuthenticated: !!session,
    handleLogout,
    isLoggingOut
  };
};
