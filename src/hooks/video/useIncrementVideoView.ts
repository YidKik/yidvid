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
        .select("id")
        .eq('id', videoId)
        .single();
      
      if (checkError) {
        console.error("Error checking video existence:", checkError);
        throw new Error(`Video with ID ${videoId} not found`);
      }
      
      // Now update the view count
      const { data: updatedVideo, error: updateError } = await supabase
        .from("youtube_videos")
        .update({ 
          views: supabase.rpc('increment_counter'),  // Using RPC function
          last_viewed_at: new Date().toISOString() 
        })
        .eq('id', videoId)
        .select("id, views");

      if (updateError) {
        console.error("Error incrementing view count:", updateError);
        
        // Fallback to direct update if RPC fails
        const { data: directUpdate, error: directError } = await supabase
          .from("youtube_videos")
          .select("views")
          .eq('id', videoId)
          .single();
          
        if (directError) {
          console.error("Error fetching current view count:", directError);
          throw new Error("Failed to increment view count");
        }
        
        const currentViews = directUpdate?.views || 0;
        const newViewCount = currentViews + 1;
        
        const { error: finalError } = await supabase
          .from("youtube_videos")
          .update({ 
            views: newViewCount,
            last_viewed_at: new Date().toISOString() 
          })
          .eq('id', videoId);
          
        if (finalError) {
          console.error("Final error incrementing view count:", finalError);
          
          // Use edge function as last resort
          try {
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
          console.log("Successfully incremented view count with direct update to", newViewCount);
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
