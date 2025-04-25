
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
      
      // Directly update the views column with an increment expression
      const { error } = await supabase
        .from("youtube_videos")
        .update({ 
          views: supabase.rpc('increment_counter'), // Using RPC instead of SQL template
          last_viewed_at: new Date().toISOString() 
        })
        .eq('id', videoId);

      if (error) {
        console.error("Error incrementing view count:", error);
        // Try the Edge Function as a fallback
        try {
          const { error: fnError } = await supabase.functions.invoke('increment_counter', {
            body: { videoId }
          });
          
          if (fnError) {
            console.error("Edge function error:", fnError);
            return;
          }
          
          console.log("Successfully incremented view via edge function");
        } catch (fnInvokeError) {
          console.error("Error invoking edge function:", fnInvokeError);
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
