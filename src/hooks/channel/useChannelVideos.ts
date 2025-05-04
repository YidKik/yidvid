
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const INITIAL_VIDEOS_COUNT = 12;
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

      console.log("Fetching videos for channel:", channelId);
      
      try {
        // Call the edge function directly with proper authorization
        const response = await fetch(`https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/get-public-videos?channel_id=${channelId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg`
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

  // Set displayed videos when initial fetch completes
  useEffect(() => {
    if (initialVideos) {
      // Ensure videos are sorted by uploaded_at before setting state
      const sortedVideos = [...initialVideos].sort((a, b) => {
        const dateA = new Date(a.uploaded_at).getTime();
        const dateB = new Date(b.uploaded_at).getTime();
        return dateB - dateA; // Newest first
      });
      
      setDisplayedVideos(sortedVideos);
      console.log("Set displayed videos:", sortedVideos.length);
    }
  }, [initialVideos]);

  // Add refetch function to allow parent components to trigger refreshes
  const refetchVideos = useCallback(async () => {
    console.log("Manually refetching videos for channel:", channelId);
    return await refetchInitialVideos();
  }, [channelId, refetchInitialVideos]);

  return {
    displayedVideos,
    isLoadingInitialVideos,
    isLoadingMore,
    INITIAL_VIDEOS_COUNT,
    refetchVideos,
    error
  };
};
