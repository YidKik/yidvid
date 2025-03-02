
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

  // Check if we should fetch new videos - more aggressive timeframe
  const shouldFetchNew = () => {
    // Fetch new videos if:
    // 1. We've never fetched successfully
    // 2. It's been more than 2 hours since last fetch (reduced from 4 hours)
    // 3. We've had previous fetch attempts 
    return lastSuccessfulFetch === null || 
           (Date.now() - lastSuccessfulFetch.getTime() > 7200000) || // 2 hours
           fetchAttempts > 0;
  };

  const fetchAllVideos = async (): Promise<VideoData[]> => {
    console.log("Starting video fetch process with highest priority...");
    
    try {
      // First try direct database query with error handling
      let videosData: any[] = [];
      try {
        // Try direct query first to bypass RLS issues
        const { data, error } = await supabase
          .from("youtube_videos")
          .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, category, description")
          .is("deleted_at", null)
          .order("uploaded_at", { ascending: false })
          .limit(200);
          
        if (error) {
          console.error("Direct database query error:", error);
          throw error;
        }
        
        if (data && data.length > 0) {
          videosData = data;
          setLastSuccessfulFetch(new Date());
          console.log(`Successfully fetched ${videosData.length} videos directly from database`);
        } else {
          console.warn("No videos found in direct database query");
          // Fall through to next approach
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
          } else {
            console.warn("No videos found in database, will try to fetch new ones with high priority");
          }
        } catch (error) {
          console.error("Error fetching videos from database:", error);
          // We'll continue anyway and use sample data if needed
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

      // Always attempt to fetch new videos with high priority 
      const shouldFetchNewVideos = shouldFetchNew();
      console.log(`Should fetch new videos (high priority): ${shouldFetchNewVideos}`);
      
      if (channelIds.length > 0 && shouldFetchNewVideos) {
        // Try to fetch new videos with high priority
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

      // Ensure we always return something even if it's sample data
      if (!videosData || videosData.length === 0) {
        console.warn("No videos data available, returning sample data");
        videosData = getSampleVideoData(20);
      }

      // Return what we have, even if it's sample data
      return formatVideoData(videosData);
    } catch (error: any) {
      console.error("Error in video fetching process:", error);
      // For any errors, increase the fetch attempts counter
      setFetchAttempts(prev => prev + 1);
      // Generate sample data as a fallback
      return formatVideoData(getSampleVideoData(20));
    }
  };

  const getSampleVideoData = (count: number): any[] => {
    console.log(`Generating ${count} sample video items as fallback`);
    const sampleData = [];
    
    const categories = ["music", "torah", "inspiration", "podcast", "education", "entertainment"];
    
    for (let i = 1; i <= count; i++) {
      sampleData.push({
        id: `sample-${i}`,
        video_id: `sample-${i}`,
        title: `Video ${i} - Content being updated, please refresh`,
        thumbnail: "/placeholder.svg",
        channel_name: `Sample Channel ${Math.ceil(i/2)}`,
        channel_id: `sample-channel-${Math.ceil(i/2)}`,
        views: i * 100,
        uploaded_at: new Date().toISOString(),
        category: categories[i % categories.length],
        description: "Content is currently updating. Please refresh to see the latest videos."
      });
    }
    
    return sampleData;
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
