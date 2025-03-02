
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { checkApiQuota } from "./useApiQuota";

export interface VideoData {
  id: string;
  video_id: string;
  title: string;
  thumbnail: string;
  channelName: string;
  channelId: string;
  views: number;
  uploadedAt: string | Date;
}

export interface VideoFetcherResult {
  fetchAllVideos: () => Promise<VideoData[]>;
  fetchAttempts: number;
  lastSuccessfulFetch: Date | null;
  setFetchAttempts: (value: number | ((prev: number) => number)) => void;
  setLastSuccessfulFetch: (value: Date | null) => void;
}

/**
 * Hook with functionality to fetch all videos from the database
 * and trigger edge function for fetching new videos
 */
export const useVideoFetcher = (): VideoFetcherResult => {
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const [lastSuccessfulFetch, setLastSuccessfulFetch] = useState<Date | null>(null);

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
          setFetchAttempts(0);
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
      
      if (channelIds.length > 0 && shouldFetchNewVideos) {
        // Try to fetch new videos if quota allows
        try {
          await tryFetchNewVideos(channelIds, videosData);
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

  // Helper to fetch videos from database
  const fetchVideosFromDatabase = async () => {
    try {
      // Adding null checking for the response to avoid crashes
      const { data: initialData, error: dbError } = await supabase
        .from("youtube_videos")
        .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at")
        .is('deleted_at', null)
        .order("uploaded_at", { ascending: false });

      if (dbError) {
        console.error("Error fetching videos from database:", dbError);
        return [];
      }
      
      return initialData || [];
    } catch (err) {
      console.error("Failed to fetch videos from database:", err);
      return [];
    }
  };

  // Helper to fetch active channels
  const fetchActiveChannels = async () => {
    try {
      const { data: channels, error: channelError } = await supabase
        .from("youtube_channels")
        .select("channel_id")
        .is("deleted_at", null);

      if (channelError) {
        console.error("Error fetching channels:", channelError);
        return [];
      }
      
      return channels || [];
    } catch (err) {
      console.error("Failed to fetch channels:", err);
      return [];
    }
  };

  // Check if we should fetch new videos
  const shouldFetchNew = () => {
    // Only fetch every 12 hours automatically (43200000 ms)
    return lastSuccessfulFetch === null || 
           (Date.now() - lastSuccessfulFetch.getTime() > 43200000) || // 12 hours
           fetchAttempts > 0; // Also fetch if we've had previous attempts
  };

  // Try to fetch new videos if quota allows
  const tryFetchNewVideos = async (channelIds: string[], existingData: any[]) => {
    try {
      let quotaInfo = null;
      try {
        quotaInfo = await checkApiQuota();
      } catch (error) {
        console.warn("Could not check quota:", error);
        // Continue anyway, but with caution
      }
      
      // Only proceed if we have at least 20% of daily quota remaining (2000 units)
      // or if we couldn't check quota (null)
      if (quotaInfo === null || quotaInfo.quota_remaining >= 2000) {
        // Call edge function to fetch new videos
        const result = await fetchNewVideosFromEdgeFunction(channelIds);
        
        if (result.success) {
          // Refetch videos after successful update
          return await fetchUpdatedVideosAfterSync();
        }
      } else {
        console.log('Using cached video data due to quota limitations');
      }
      
      return existingData;
    } catch (error) {
      console.error("Error fetching new videos:", error);
      setFetchAttempts(prev => prev + 1);
      return existingData;
    }
  };

  // Call edge function to fetch new videos
  const fetchNewVideosFromEdgeFunction = async (channelIds: string[]) => {
    try {
      const { data: response, error: fetchError } = await supabase.functions.invoke('fetch-youtube-videos', {
        body: { 
          channels: channelIds,
          forceUpdate: fetchAttempts > 2, // Force update if we've had multiple attempts
          quotaConservative: true, // Flag to indicate conservative quota usage
          prioritizeRecent: true, // Flag to prioritize recently active channels
          maxChannelsPerRun: 5 // Limit the number of channels processed in a single run
        }
      });

      if (fetchError) {
        console.error('Error invoking fetch-youtube-videos:', fetchError);
        setFetchAttempts(prev => prev + 1);
        return { success: false };
      }
      
      console.log('Fetch response:', response);
      
      if (response?.success) {
        console.log(`Successfully processed ${response.processed} channels, found ${response.newVideos} new videos`);
        setFetchAttempts(0);
        setLastSuccessfulFetch(new Date());
        return { success: true };
      } else if (response?.quota_reset_at) {
        const resetTime = new Date(response.quota_reset_at);
        console.log(`YouTube quota limited. Full service will resume at ${resetTime.toLocaleString()}`);
      }
      
      return { success: false };
    } catch (error) {
      console.error("Error in fetchNewVideosFromEdgeFunction:", error);
      return { success: false };
    }
  };

  // Fetch updated videos after sync
  const fetchUpdatedVideosAfterSync = async () => {
    try {
      const { data: updatedData, error: updateError } = await supabase
        .from("youtube_videos")
        .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at")
        .is('deleted_at', null)
        .order("uploaded_at", { ascending: false });

      if (updateError) {
        console.error('Error fetching updated videos:', updateError);
        return [];
      }
      
      return updatedData || [];
    } catch (error) {
      console.error("Error in fetchUpdatedVideosAfterSync:", error);
      return [];
    }
  };

  // Format video data for return
  const formatVideoData = (videosData: any[]): VideoData[] => {
    return videosData.map(video => ({
      id: video.id,
      video_id: video.video_id,
      title: video.title,
      thumbnail: video.thumbnail,
      channelName: video.channel_name,
      channelId: video.channel_id,
      views: video.views || 0,
      uploadedAt: video.uploaded_at
    }));
  };

  return {
    fetchAllVideos,
    fetchAttempts,
    lastSuccessfulFetch,
    setFetchAttempts,
    setLastSuccessfulFetch
  };
};
