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

  // Keep a record of videos that have already been counted in this session
  const viewedVideos = new Set<string>();

  const incrementView = useCallback(async (videoId: string) => {
    console.log("Incrementing view:", videoId);
    // Skip if we've already counted a view for this video in this session
   // if (viewedVideos.has(videoId) || isUpdating) return;
    
    try {
      setIsUpdating(true);
      viewedVideos.add(videoId); // Mark this video as viewed in this session
      
      console.log("Incrementing view count for video:", videoId);
      
      // First, fetch the current view count
      const { data: currentVideo, error: fetchError } = await supabase
        .from("youtube_videos")
        .select("views")
        .eq('id', videoId)
        .single();
        console.log("Incrementing checking:", currentVideo,fetchError);
      if (fetchError) {
        console.error("Error fetching current view count:", fetchError);
        return;
      }
      
      // Now update with incremented value
      const currentViews = currentVideo?.views || 0;
      const newViewCount = currentViews + 1;
      
      const { error } = await supabase
        .from("youtube_videos")
        .update({ 
          views: newViewCount,
          last_viewed_at: new Date().toISOString() 
        })
        .eq('id', videoId);

      if (error) {
        console.error("Error incrementing view count:", error);
        
        // Try a different approach if the first one fails
        try {
          // Attempt to call the edge function as a fallback
          const response = await fetch(
            'https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/increment_counter',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg`
              },
              body: JSON.stringify({ videoId })
            }
          );
          
          if (!response.ok) {
            throw new Error(`Edge function error: ${response.statusText}`);
          }
          
          console.log("Successfully incremented view with edge function");
        } catch (edgeError) {
          console.error("Error with edge function increment:", edgeError);
        }
      } else {
        console.log("Successfully incremented view count to", newViewCount);
      }
      
      // Invalidate the video query to get fresh data with updated view count
      queryClient.invalidateQueries({ queryKey: ["video", videoId] });
      queryClient.invalidateQueries({ queryKey: ["youtube_videos"] });

    } catch (error) {
      console.error("Error incrementing view count:", error);
    } finally {
      setIsUpdating(false);
    }
  }, [viewedVideos, isUpdating, queryClient]);

  return incrementView;
};
