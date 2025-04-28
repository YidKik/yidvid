
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook to increment a video's view count
 */
export const useIncrementVideoView = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [viewedVideos, setViewedVideos] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  // Initialize the viewed videos set from sessionStorage when the hook is first used
  useEffect(() => {
    try {
      const storedVideos = sessionStorage.getItem('viewedVideos');
      if (storedVideos) {
        setViewedVideos(new Set(JSON.parse(storedVideos)));
      }
    } catch (error) {
      console.error("Error reading from sessionStorage:", error);
    }
  }, []);

  const incrementView = useCallback(async (videoId: string) => {
    if (!videoId) {
      console.error("Invalid video ID");
      return;
    }

    // Skip if we've already counted a view for this video in this session
    if (viewedVideos.has(videoId)) {
      console.log("Video already viewed in this session, skipping increment:", videoId);
      return;
    }

    // Only skip if already in the process of updating
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      
      console.log("Incrementing view count for video:", videoId);
      
      // Use edge function for incrementing view count
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
      
      // Add the video to the viewed set and update sessionStorage
      setViewedVideos(prev => {
        const newSet = new Set(prev);
        newSet.add(videoId);
        try {
          sessionStorage.setItem('viewedVideos', JSON.stringify([...newSet]));
        } catch (error) {
          console.error("Error writing to sessionStorage:", error);
        }
        return newSet;
      });
      
      // Invalidate the video query to get fresh data with updated view count
      queryClient.invalidateQueries({ queryKey: ["video", videoId] });
      queryClient.invalidateQueries({ queryKey: ["youtube_videos"] });

    } catch (error) {
      console.error("Error incrementing view count:", error);
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating, queryClient, viewedVideos]);

  return incrementView;
};
