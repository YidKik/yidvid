
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const INITIAL_VIDEOS_COUNT = 12; // Increased from 6
const FETCH_TIMEOUT = 8000; // 8 seconds timeout (increased)

export const useChannelVideos = (channelId: string | undefined) => {
  const [displayedVideos, setDisplayedVideos] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Use a more efficient query with timeout and better caching
  const { data: initialVideos, isLoading: isLoadingInitialVideos } = useQuery({
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

        console.log(`Successfully fetched ${data?.length || 0} initial videos`);
        return data || [];
      };
      
      // Race the fetch against the timeout
      try {
        return await Promise.race([fetchPromise(), timeoutPromise]) as any[];
      } catch (error) {
        console.error("Error or timeout in initial fetch:", error);
        // On timeout or error, try a simpler query
        const { data } = await supabase
          .from("youtube_videos")
          .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, category, description")
          .eq("channel_id", channelId)
          .is("deleted_at", null)
          .order("uploaded_at", { ascending: false })
          .limit(INITIAL_VIDEOS_COUNT);
          
        return data || [];
      }
    },
    retry: 2, // Increased retries
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    meta: {
      suppressToasts: true // Don't show toast notifications
    }
  });

  // Only fetch all videos if we have initial videos
  const { data: allVideos, isFetching: isFetchingAll } = useQuery({
    queryKey: ["all-channel-videos", channelId],
    queryFn: async () => {
      if (!channelId) throw new Error("Channel ID is required");

      console.log("Fetching all videos for channel:", channelId);

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

  return {
    displayedVideos,
    isLoadingInitialVideos,
    isLoadingMore,
    INITIAL_VIDEOS_COUNT,
  };
};
