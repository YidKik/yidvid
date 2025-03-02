
import { useState } from "react";
import { VideoData, VideoFetcherResult } from "./types/video-fetcher";
import { fetchVideosFromDatabase, fetchActiveChannels, formatVideoData } from "./utils/video-database";
import { tryFetchNewVideos } from "./utils/youtube-fetch";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook with functionality to fetch all videos from the database
 * and trigger edge function for fetching new videos
 */
export const useVideoFetcher = (): VideoFetcherResult => {
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const [lastSuccessfulFetch, setLastSuccessfulFetch] = useState<Date | null>(null);

  // Check if we should fetch new videos
  const shouldFetchNew = () => {
    // Only fetch every 4 hours automatically (14400000 ms)
    return lastSuccessfulFetch === null || 
           (Date.now() - lastSuccessfulFetch.getTime() > 14400000) || // 4 hours
           fetchAttempts > 0; // Also fetch if we've had previous attempts
  };

  const fetchAllVideos = async (): Promise<VideoData[]> => {
    console.log("Starting video fetch process...");
    
    try {
      // First fetch existing videos from database - this is the most important part
      let videosData: any[] = [];
      try {
        videosData = await fetchVideosFromDatabase();
        
        // If we already have videos, set successful fetch even if the next part fails
        if (videosData.length > 0) {
          setLastSuccessfulFetch(new Date());
          console.log(`Successfully fetched ${videosData.length} videos from database`);
        } else {
          console.warn("No videos found in database, will try to fetch new ones");
        }
      } catch (error) {
        console.error("Error fetching videos from database:", error);
        // We'll continue anyway to try other operations
      }

      // Try to get active channels, but don't fail the whole operation if this fails
      let channelIds: string[] = [];
      try {
        const channels = await fetchActiveChannels();
        channelIds = channels?.map(c => c.channel_id) || [];
        console.log(`Found ${channelIds.length} channels to process`);
      } catch (error) {
        console.error("Error fetching channels:", error);
        // Continue with what we have
      }

      // Check if we should fetch new videos
      const shouldFetchNewVideos = shouldFetchNew();
      console.log(`Should fetch new videos: ${shouldFetchNewVideos}`);
      
      if (channelIds.length > 0 && shouldFetchNewVideos) {
        // Try to fetch new videos if quota allows
        try {
          const updatedVideos = await tryFetchNewVideos(
            channelIds,
            videosData,
            fetchAttempts,
            setFetchAttempts,
            setLastSuccessfulFetch
          );
          
          if (updatedVideos && updatedVideos.length > 0) {
            videosData = updatedVideos;
            console.log(`Updated videos with fresh data, now have ${videosData.length} videos`);
          }
        } catch (error) {
          console.error("Error in tryFetchNewVideos:", error);
          // Continue with what we have
        }
      }

      // Return what we have, even if it's an empty array
      return formatVideoData(videosData);
    } catch (error: any) {
      console.error("Error in video fetching process:", error);
      // For any errors, increase the fetch attempts counter
      setFetchAttempts(prev => prev + 1);
      // For any errors, return an empty array rather than failing completely
      return [];
    }
  };

  const forceRefetch = async (): Promise<VideoData[]> => {
    setFetchAttempts(prev => prev + 1);
    return fetchAllVideos();
  };

  return {
    fetchAllVideos,
    forceRefetch,
    fetchAttempts,
    lastSuccessfulFetch,
    setFetchAttempts,
    setLastSuccessfulFetch
  };
};

// Re-export VideoData type for convenience
export type { VideoData } from "./types/video-fetcher";
