
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const FETCH_TIMEOUT = 8000; // 8 seconds timeout

export const useChannelVideos = (channelId: string | undefined) => {
  const [displayedVideos, setDisplayedVideos] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Use a direct edge function call for better reliability
  const { 
    data: initialVideos, 
    isLoading: isLoadingInitialVideos,
    refetch: refetchInitialVideos,
    error
  } = useQuery({
    queryKey: ["channel-videos", channelId],
    queryFn: async () => {
      if (!channelId) throw new Error("Channel ID is required");

      console.log("Fetching ALL videos for channel:", channelId);
      
      try {
        // First try direct database query - only get non-deleted videos
        const { data: dbVideos, error: dbError } = await supabase
          .from("youtube_videos")
          .select("*")
          .eq("channel_id", channelId)
          .is("deleted_at", null) // Filter out deleted videos
          .order("uploaded_at", { ascending: false });

        if (!dbError && dbVideos && dbVideos.length > 0) {
          console.log(`Found ${dbVideos.length} videos from database for channel ${channelId}`);
          return dbVideos;
        }

        // Fallback to edge function
        const response = await fetch(`https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/get-public-videos?channel_id=${channelId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Use Supabase client instead of direct fetch
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching videos: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log("Edge function response:", result);
        
        // Handle both possible response formats and ensure sorting
        if (result.data && Array.isArray(result.data) && result.data.length > 0) {
          console.log(`Found ${result.data.length} videos for channel ${channelId}`);
          
          // Ensure videos are sorted by uploaded_at in descending order
          const sortedVideos = result.data.sort((a: any, b: any) => {
            const dateA = new Date(a.uploaded_at).getTime();
            const dateB = new Date(b.uploaded_at).getTime();
            return dateB - dateA; // Newest first
          });
          
          return sortedVideos;
        }
        
        if (result.videos && Array.isArray(result.videos)) {
          console.log(`Found ${result.videos.length} videos for channel ${channelId}`);
          
          // Ensure videos are sorted by uploaded_at in descending order
          const sortedVideos = result.videos.sort((a: any, b: any) => {
            const dateA = new Date(a.uploaded_at).getTime();
            const dateB = new Date(b.uploaded_at).getTime();
            return dateB - dateA; // Newest first
          });
          
          return sortedVideos;
        }
        
        console.log("No videos found for channel:", channelId);
        return [];
        
      } catch (error) {
        console.error("Error fetching videos:", error);
        throw error;
      }
    },
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!channelId,
    meta: {
      suppressToasts: true // Don't show toast notifications
    }
  });

  // Set displayed videos when initial fetch completes - show ALL videos
  useEffect(() => {
    if (initialVideos) {
      // Ensure videos are sorted by uploaded_at before setting state
      const sortedVideos = [...initialVideos].sort((a, b) => {
        const dateA = new Date(a.uploaded_at).getTime();
        const dateB = new Date(b.uploaded_at).getTime();
        return dateB - dateA; // Newest first
      });
      
      setDisplayedVideos(sortedVideos); // Show ALL videos, no limit
      console.log("Set displayed videos (ALL):", sortedVideos.length);
    }
  }, [initialVideos]);

  // Add refetch function to allow parent components to trigger refreshes
  const refetchVideos = useCallback(async () => {
    console.log("Manually refetching ALL videos for channel:", channelId);
    return await refetchInitialVideos();
  }, [channelId, refetchInitialVideos]);

  return {
    displayedVideos,
    isLoadingInitialVideos,
    isLoadingMore,
    INITIAL_VIDEOS_COUNT: displayedVideos.length, // Return actual count, not a fixed limit
    refetchVideos,
    error
  };
};
