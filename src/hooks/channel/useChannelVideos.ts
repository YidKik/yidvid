
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const INITIAL_VIDEOS_COUNT = 12; // Increased from 6
const FETCH_TIMEOUT = 8000; // 8 seconds timeout (increased)

export const useChannelVideos = (channelId: string | undefined) => {
  const [displayedVideos, setDisplayedVideos] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Use a more efficient query with timeout and better caching
  const { 
    data: initialVideos, 
    isLoading: isLoadingInitialVideos,
    refetch: refetchInitialVideos
  } = useQuery({
    queryKey: ["initial-channel-videos", channelId],
    queryFn: async () => {
      if (!channelId) throw new Error("Channel ID is required");

      console.log("Fetching initial videos for channel:", channelId);
      
      // Create a timeout promise to abort long-running requests
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Request timeout")), FETCH_TIMEOUT)
      );
      
      // Create the actual fetch promise
      const fetchPromise = async () => {
        try {
          // First try with join for thumbnails
          const { data, error } = await supabase
            .from("youtube_videos")
            .select(`
              *,
              youtube_channels(thumbnail_url)
            `)
            .eq("channel_id", channelId)
            .is("deleted_at", null)
            .order("uploaded_at", { ascending: false })
            .limit(INITIAL_VIDEOS_COUNT);

          if (error) {
            console.error("Error fetching initial videos:", error);
            throw error;
          }

          if (data && data.length > 0) {
            console.log(`Successfully fetched ${data.length} initial videos with channel data`);
            return data;
          }
          
          // If no results, try edge function as backup
          console.log("No videos found in database, trying edge function");
          const { data: edgeData, error: edgeError } = await supabase.functions.invoke(
            'get-public-videos',
            {
              headers: {
                'Content-Type': 'application/json'
              },
              body: { channelId }
            }
          );
          
          if (edgeError) {
            console.error("Edge function error:", edgeError);
            throw edgeError;
          }
          
          // Check and extract videos from edge function response
          if (edgeData?.data && edgeData.data.length > 0) {
            console.log(`Edge function returned ${edgeData.data.length} videos`);
            return edgeData.data;
          }
          
          console.log("No videos found from any source for channel:", channelId);
          return [];
        } catch (dbError) {
          console.error("Database query error:", dbError);
          
          // Fall back to simpler query on error
          const { data } = await supabase
            .from("youtube_videos")
            .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, category, description")
            .eq("channel_id", channelId)
            .is("deleted_at", null)
            .order("uploaded_at", { ascending: false })
            .limit(INITIAL_VIDEOS_COUNT);
            
          return data || [];
        }
      };
      
      // Race the fetch against the timeout
      try {
        return await Promise.race([fetchPromise(), timeoutPromise]) as any[];
      } catch (error) {
        console.error("Error or timeout in initial fetch:", error);
        
        // On timeout or error, try a direct edge function call as last resort
        try {
          console.log("Attempting direct edge function call to get-public-videos");
          const response = await fetch(`https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/get-public-videos?channel_id=${channelId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg`
            }
          });
          
          if (!response.ok) {
            throw new Error(`Edge function error: ${response.statusText}`);
          }
          
          const result = await response.json();
          console.log("Direct edge function response:", result);
          
          if (result.data && Array.isArray(result.data) && result.data.length > 0) {
            return result.data;
          }
        } catch (fetchError) {
          console.error("Direct fetch error:", fetchError);
        }
        
        return [];
      }
    },
    retry: 2, // Increased retries
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!channelId, // Only run if we have a channelId
    meta: {
      suppressToasts: true // Don't show toast notifications
    }
  });

  // Only fetch all videos if we have initial videos
  const { 
    data: allVideos, 
    isFetching: isFetchingAll,
    refetch: refetchAllVideos 
  } = useQuery({
    queryKey: ["all-channel-videos", channelId],
    queryFn: async () => {
      if (!channelId) throw new Error("Channel ID is required");

      console.log("Fetching all videos for channel:", channelId);

      try {
        const { data, error } = await supabase
          .from("youtube_videos")
          .select(`
            *,
            youtube_channels(thumbnail_url)
          `)
          .eq("channel_id", channelId)
          .is("deleted_at", null)
          .order("uploaded_at", { ascending: false })
          .limit(100); // Increased from unlimited to a large but limited number for performance

        if (error) {
          console.error("Error fetching all videos:", error);
          return initialVideos || [];
        }

        console.log(`Successfully fetched ${data?.length || 0} total videos`);
        return data || [];
      } catch (error) {
        console.error("Error fetching all videos:", error);
        return initialVideos || [];
      }
    },
    enabled: !!channelId && !!initialVideos && initialVideos.length > 0,
    retry: 2, // Increased retries
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    meta: {
      suppressToasts: true // Don't show toast notifications
    }
  });

  // Set displayed videos immediately from initial fetch
  useEffect(() => {
    if (initialVideos?.length) {
      setDisplayedVideos(initialVideos);
      console.log("Set displayed videos from initial videos:", initialVideos.length);
    } else if (initialVideos?.length === 0) {
      console.log("No videos found for channel:", channelId);
      setDisplayedVideos([]);
    }
  }, [initialVideos, channelId]);

  // Load more videos with a small delay to prevent UI blocking
  useEffect(() => {
    if (allVideos && allVideos.length > INITIAL_VIDEOS_COUNT && !isFetchingAll) {
      setIsLoadingMore(true);
      
      const timer = setTimeout(() => {
        setDisplayedVideos(allVideos);
        setIsLoadingMore(false);
        console.log("All videos loaded:", allVideos.length);
      }, 300); // Shorter delay
      
      return () => clearTimeout(timer);
    }
  }, [allVideos, isFetchingAll]);

  // Add refetch function to allow parent components to trigger refreshes
  const refetchVideos = useCallback(async () => {
    console.log("Manually refetching videos for channel:", channelId);
    const results = await Promise.all([
      refetchInitialVideos(),
      initialVideos?.length ? refetchAllVideos() : Promise.resolve()
    ]);
    return results[0];
  }, [channelId, refetchInitialVideos, refetchAllVideos, initialVideos?.length]);

  return {
    displayedVideos,
    isLoadingInitialVideos,
    isLoadingMore,
    INITIAL_VIDEOS_COUNT,
    refetchVideos
  };
};
