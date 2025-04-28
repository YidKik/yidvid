
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook to increment a video's view count
 */
export const useIncrementVideoView = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  const incrementView = useCallback(async (videoId: string) => {
    if (!videoId) {
      console.error("Invalid video ID");
      return;
    }

    console.log("Incrementing view:", videoId);
    // Only skip if already in the process of updating
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      
      console.log("Incrementing view count for video:", videoId);
      
      // Use edge function for incrementing view count
      // This approach avoids the profile recursion issue
      const SUPABASE_URL = "https://euincktvsiuztsxcuqfd.supabase.co";
      const functionUrl = `${SUPABASE_URL}/functions/v1/increment_counter`;
      
      // Get auth token safely using the session
      const { data } = await supabase.auth.getSession();
      const authToken = data?.session?.access_token || '';
      
      const response = await fetch(
        functionUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ videoId })
        }
      );
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(`Edge function error: ${response.statusText}`);
      }
      
      // Access the response data correctly
      console.log("Successfully incremented view with edge function", 
        responseData?.data?.views || responseData?.data || 'unknown view count');
      
      // Invalidate the video query to get fresh data with updated view count
      queryClient.invalidateQueries({ queryKey: ["video", videoId] });
      queryClient.invalidateQueries({ queryKey: ["youtube_videos"] });

    } catch (error) {
      console.error("Error incrementing view count:", error);
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating, queryClient]);

  return incrementView;
};
