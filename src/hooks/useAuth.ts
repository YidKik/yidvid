
import { useState, useEffect } from "react";
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
  const [isAdmin, setIsAdmin] = useState(false);

  // Effect to fetch user profile and check admin status
  useEffect(() => {
    if (session?.user?.id) {
      const fetchUserProfile = async () => {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", session.user.id)
            .single();

          if (error) {
            console.error("Error fetching profile:", error);
            return;
          }

          if (data) {
            setIsAdmin(data.is_admin === true);
          }
        } catch (err) {
          console.error("Unexpected error fetching profile:", err);
        }
      };

      fetchUserProfile();
    }
  }, [session]);

  const handleLogout = async () => {
    try {
      // Set logout state immediately to update UI
      setIsLoggingOut(true);
      
      // Cancel all in-flight queries to prevent them from completing
      queryClient.cancelQueries();
      
      // Cache the minimal content data before logout
      const videosData = queryClient.getQueryData(["youtube_videos"]);
      const channelsData = queryClient.getQueryData(["youtube_channels"]);
      
      const hasVideos = Array.isArray(videosData) && videosData.length > 0;
      const hasChannels = Array.isArray(channelsData) && channelsData.length > 0;
      
      console.log(`Before logout: Cancelling queries and proceeding with immediate logout`);
      
      // Start the signOut process immediately
      const signOutPromise = supabase.auth.signOut();
      
      // Set a timeout to navigate and show success even if supabase is slow
      const timeoutId = setTimeout(() => {
        // If logout is taking too long, navigate anyway
        console.log("Logout taking too long - forcing navigation");
        navigate("/");
        toast.success("Logged out successfully");
      }, 1000); // Wait max 1 second before forcing navigation
      
      // Wait for signOut to complete (but with timeout backup)
      const { error } = await signOutPromise;
      
      // Clear the timeout as we got a response
      clearTimeout(timeoutId);
      
      if (error) {
        console.error("Error during logout:", error);
        toast.error("Error during logout: " + error.message);
      } else {
        // Clear user-specific queries
        queryClient.removeQueries({ queryKey: ["profile"] });
        queryClient.removeQueries({ queryKey: ["user-profile"] });
        queryClient.removeQueries({ queryKey: ["admin-section-profile"] });
        queryClient.removeQueries({ queryKey: ["user-video-interactions"] });
        
        // Restore content data to prevent blank screen
        if (hasVideos && videosData) {
          console.log("Restoring videos data after logout");
          queryClient.setQueryData(["youtube_videos"], videosData);
        }
        
        if (hasChannels && channelsData) {
          console.log("Restoring channels data after logout");
          queryClient.setQueryData(["youtube_channels"], channelsData);
        }
        
        // Navigate to home page after logout
        navigate("/");
        toast.success("Logged out successfully");
      }
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
    isLoggingOut,
    isAdmin
  };
};
