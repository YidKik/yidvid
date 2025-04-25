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
    // Skip if we've already counted a view for this video in this session
    if (viewedVideos.has(videoId) || isUpdating) return;
    
    try {
      setIsUpdating(true);
      viewedVideos.add(videoId); // Mark this video as viewed in this session
      
      console.log("Incrementing view count for video:", videoId);
      
      // Use a direct update with column increment instead of RPC
      const { error } = await supabase
        .from("youtube_videos")
        .update({ 
          views: supabase.rpc('increment', {}),  // Fixed: use 'increment' instead of 'increment_counter'
          last_viewed_at: new Date().toISOString() 
        })
        .eq('id', videoId);

      if (error) {
        console.error("Error incrementing view count:", error);
        // Try a simpler direct increment approach as fallback
        try {
          const { error: directError } = await supabase
            .from("youtube_videos")
            .update({ 
              views: supabase.sql`views + 1`,  // SQL fragment to increment counter
              last_viewed_at: new Date().toISOString() 
            })
            .eq('id', videoId);
            
          if (directError) {
            console.error("Direct increment error:", directError);
            return;
          }
          
          console.log("Successfully incremented view with direct update");
        } catch (directIncrementError) {
          console.error("Error with direct increment:", directIncrementError);
          return;
        }
      } else {
        console.log("Successfully incremented view count");
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
