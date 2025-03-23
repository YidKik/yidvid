
import { useState } from "react";
import { VideoData, VideoFetcherResult } from "./types/video-fetcher";
import { 
  fetchVideosFromDatabase, 
  fetchActiveChannels, 
  formatVideoData 
} from "./utils/database";
import { tryFetchNewVideos } from "./utils/youtube-fetch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Hook with functionality to fetch all videos from the database
 * and trigger edge function for fetching new videos
 */
export const useVideoFetcher = (): VideoFetcherResult => {
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const [lastSuccessfulFetch, setLastSuccessfulFetch] = useState<Date | null>(null);

  // Check if we should fetch new videos - more aggressive timeframe
  const shouldFetchNew = () => {
    // Always fetch new videos when using this hook
    return true;
  };

  const fetchAllVideos = async (): Promise<VideoData[]> => {
    console.log("Starting video fetch process with highest priority...");
    
    try {
      // First try direct database query with anon key - but now using simpler query to avoid RLS issues
      let videosData: any[] = [];
      
      try {
        // Try direct query first with simplified approach for anonymous access
        const { data, error } = await supabase
          .from("youtube_videos")
          .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, category, description")
          .is('deleted_at', null)
          .order("uploaded_at", { ascending: false })
          .limit(100);  // Reduced limit for faster loading
          
        if (error) {
          console.error("Direct database query error:", error);
          
          // Try an even simpler query if first one fails
          const fallbackData = await supabase
            .from("youtube_videos")
            .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at")
            .order("uploaded_at", { ascending: false })
            .limit(50);
            
          if (!fallbackData.error && fallbackData.data && fallbackData.data.length > 0) {
            videosData = fallbackData.data;
            setLastSuccessfulFetch(new Date());
            console.log(`Retrieved ${videosData.length} videos with fallback query`);
          } else {
            console.warn("Fallback query also failed, trying secondary method");
          }
        } else if (data && data.length > 0) {
          videosData = data;
          setLastSuccessfulFetch(new Date());
          console.log(`Successfully fetched ${videosData.length} videos directly from database`);
        } else {
          console.warn("No videos found in direct database query, trying secondary method");
        }
      } catch (directError) {
        console.error("Error in direct video fetch:", directError);
        // Continue to next approach
      }
      
      // If direct query failed, try fetchVideosFromDatabase with additional fallbacks
      if (videosData.length === 0) {
        try {
          videosData = await fetchVideosFromDatabase();
          
          // If we already have videos, set successful fetch even if the next part fails
          if (videosData.length > 0) {
            setLastSuccessfulFetch(new Date());
            console.log(`Successfully fetched ${videosData.length} videos from database`);
            
            // Toast notification only if we previously had no videos (first successful load)
            if (fetchAttempts > 0) {
              toast.success("Successfully loaded videos");
            }
          } else {
            console.warn("No videos found in database, will try to fetch new ones with high priority");
          }
        } catch (error) {
          console.error("Error fetching videos from database:", error);
          // Continue to fetch with edge function
        }
      }

      // Try to get active channels, but don't fail the whole operation if this fails
      let channelIds: string[] = [];
      try {
        const channels = await fetchActiveChannels();
        channelIds = channels?.map(c => c.channel_id) || [];
        console.log(`Found ${channelIds.length} channels to process with high priority`);
      } catch (error) {
        console.error("Error fetching channels:", error);
        // Continue with what we have
      }

      // Always try to fetch new videos if we have channels
      if (channelIds.length > 0) {
        try {
          const updatedVideos = await tryFetchNewVideos(
            channelIds,
            videosData,
            fetchAttempts,
            setFetchAttempts,
            setLastSuccessfulFetch,
            true // High priority flag
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

      // If we still have no videos, only then create sample data as fallback
      if (videosData.length === 0) {
        console.warn("No videos found, creating fallback sample data");
        const now = new Date();
        videosData = Array(12).fill(null).map((_, i) => ({
          id: `sample-${i}`,
          video_id: `sample-vid-${i}`,
          title: `Sample Video ${i+1}`,
          thumbnail: '/placeholder.svg',
          channel_name: "Sample Channel",
          channel_id: "sample-channel",
          views: 1000 * (i+1),
          uploaded_at: new Date(now.getTime() - (i * 86400000)).toISOString(),
          category: "other",
          description: "This is a sample video until real content loads."
        }));
      }

      // Log success and increase fetch attempt counter
      setFetchAttempts(prev => prev + 1);
      
      // Return the data we got
      return formatVideoData(videosData);
    } catch (error: any) {
      console.error("Error in video fetching process:", error);
      // For any errors, increase the fetch attempts counter
      setFetchAttempts(prev => prev + 1);
      
      // Create and return fallback data only if we have no real data
      const now = new Date();
      return Array(12).fill(null).map((_, i) => ({
        id: `sample-${i}`,
        video_id: `sample-vid-${i}`,
        title: `Sample Video ${i+1}`,
        thumbnail: '/placeholder.svg',
        channelName: "Sample Channel",
        channelId: "sample-channel",
        views: 1000 * (i+1),
        uploadedAt: new Date(now.getTime() - (i * 86400000)).toISOString(),
        category: "other",
        description: "This is a sample video until real content loads."
      }));
    }
  };

  const forceRefetch = async (): Promise<VideoData[]> => {
    console.log("Forcing complete refresh of all videos...");
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
