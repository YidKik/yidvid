
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * This hook prefetches video and channel data when the user is on the homepage
 * so that it's ready when they navigate to the videos page
 */
export const usePrefetchData = () => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Start prefetching as soon as the user is on the homepage
    const prefetchVideos = async () => {
      console.log("Prefetching videos and channels for faster navigation...");
      
      try {
        // Prefetch videos
        queryClient.prefetchQuery({
          queryKey: ["youtube_videos"],
          queryFn: async () => {
            const { data, error } = await supabase
              .from("youtube_videos")
              .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at")
              .is("deleted_at", null)
              .order("uploaded_at", { ascending: false })
              .limit(150);
              
            if (error) {
              console.warn("Error prefetching videos:", error);
              return [];
            }
            return data || [];
          },
          staleTime: 5 * 60 * 1000 // 5 minutes
        });
        
        // Prefetch channels
        queryClient.prefetchQuery({
          queryKey: ["youtube_channels"],
          queryFn: async () => {
            const { data, error } = await supabase
              .from("youtube_channels")
              .select("id, channel_id, title, thumbnail_url, description")
              .is("deleted_at", null)
              .limit(100);
              
            if (error) {
              console.warn("Error prefetching channels:", error);
              return [];
            }
            return data || [];
          },
          staleTime: 5 * 60 * 1000 // 5 minutes
        });
      } catch (err) {
        console.error("Failed to prefetch data:", err);
      }
    };
    
    // Execute prefetch after a short delay to prioritize loading the homepage first
    const prefetchTimer = setTimeout(() => {
      prefetchVideos();
    }, 2000);
    
    return () => clearTimeout(prefetchTimer);
  }, [queryClient]);
};
