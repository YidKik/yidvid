
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
    if (!videoId) {
      console.error("Invalid video ID");
      return;
    }

    console.log("Incrementing view:", videoId);
    // Skip if we've already counted a view for this video in this session
    if (viewedVideos.has(videoId) || isUpdating) return;
    
    try {
      setIsUpdating(true);
      viewedVideos.add(videoId); // Mark this video as viewed in this session
      
      console.log("Incrementing view count for video:", videoId);
      
      // First, check if the video exists
      const { data: videoExists, error: checkError } = await supabase
        .from("youtube_videos")
        .select("*")
        .filter("id", "eq", videoId)
        .single();
        
      console.log("Incrementing view video existence:", videoExists);
      if (checkError) {
        console.error("Error checking video existence:", checkError);
        throw new Error(`Video with ID ${videoId} not found`);
      }
      
      // Now update the view count - using direct increment instead of RPC
      const currentViews = videoExists?.views || 0;
      const newViewCount = currentViews + 1;
      
      const { data: updatedVideo, error: updateError } = await supabase
        .from("youtube_videos")
        .update({ 
          views: newViewCount,
          updated_at: new Date(),
          last_viewed_at: new Date() 
        })
        .filter("id", "eq", videoId)
        .select("id, views");
      
      console.log("updatedVideo Incrementing view video existence:", updatedVideo);
      if (updateError) {
        console.error("Error incrementing view count:", updateError);
        
        // Use edge function as fallback - using dynamic URL from supabase config
        try {
          // Extract the URL and API key from the supabase client
          const supabaseUrl = supabase.supabaseUrl;
          const supabaseKey = supabase.supabaseKey;
          
          // Construct the edge function URL dynamically
          const functionUrl = `${supabaseUrl}/functions/v1/increment_counter`;
          
          const response = await fetch(
            functionUrl,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseKey}`
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
        console.log("Successfully incremented view count to", updatedVideo?.[0]?.views);
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
