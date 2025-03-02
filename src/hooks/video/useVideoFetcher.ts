
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
    let videosData = [];
    
    try {
      // First fetch existing videos from database with limited columns
      const { data: initialData, error: dbError } = await supabase
        .from("youtube_videos")
        .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at")
        .is('deleted_at', null)
        .order("uploaded_at", { ascending: false });

      if (dbError) {
        console.error("Error fetching videos from database:", dbError);
        // Don't throw, continue with empty array
      } else {
        videosData = initialData || [];
      }

      // If we already have videos, set successful fetch even if the next part fails
      if (videosData.length > 0) {
        setLastSuccessfulFetch(new Date());
        setFetchAttempts(0);
      }

      // Get all active channels with limited columns
      const { data: channels, error: channelError } = await supabase
        .from("youtube_channels")
        .select("channel_id")
        .is("deleted_at", null);

      if (channelError) {
        console.error("Error fetching channels:", channelError);
        // Don't throw, continue with what we have
      }

      const channelIds = channels?.map(c => c.channel_id) || [];
      console.log(`Found ${channelIds.length} channels to process`);

      // Check if we should fetch new videos - much more conservative time window
      // Only fetch every 12 hours automatically (43200000 ms) 
      const shouldFetchNewVideos = lastSuccessfulFetch === null || 
                              (Date.now() - lastSuccessfulFetch.getTime() > 43200000) || // 12 hours
                              fetchAttempts > 0; // Also fetch if we've had previous attempts

      if (channelIds.length > 0 && shouldFetchNewVideos) {
        // Check quota before making requests
        try {
          const quotaInfo = await checkApiQuota();
          
          // Only proceed if we have at least 20% of daily quota remaining (2000 units)
          if (!quotaInfo || quotaInfo.quota_remaining < 2000) {
            const resetTime = quotaInfo ? new Date(quotaInfo.quota_reset_at) : new Date();
            console.log('Using cached video data due to quota limitations');
          } else {
            try {
              // Trigger edge function to fetch new videos but with optimization flags
              const { data: response, error: fetchError } = await supabase.functions.invoke('fetch-youtube-videos', {
                body: { 
                  channels: channelIds,
                  forceUpdate: fetchAttempts > 2, // Force update if we've had multiple attempts
                  quotaConservative: true, // New flag to indicate conservative quota usage
                  prioritizeRecent: true, // New flag to prioritize recently active channels
                  maxChannelsPerRun: 5 // Limit the number of channels processed in a single run
                }
              });

              if (fetchError) {
                console.error('Error invoking fetch-youtube-videos:', fetchError);
                setFetchAttempts(prev => prev + 1);
                
                // Continue with existing data rather than failing completely
                console.log('Using existing video data due to fetch error');
              } else {
                console.log('Fetch response:', response);
                
                if (response?.success) {
                  console.log(`Successfully processed ${response.processed} channels, found ${response.newVideos} new videos`);
                  
                  // Refetch videos after successful update with limited columns
                  const { data: updatedData, error: updateError } = await supabase
                    .from("youtube_videos")
                    .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at")
                    .is('deleted_at', null)
                    .order("uploaded_at", { ascending: false });

                  if (updateError) {
                    console.error('Error fetching updated videos:', updateError);
                  } else if (updatedData) {
                    videosData = updatedData;
                  }
                  
                  setFetchAttempts(0);
                  setLastSuccessfulFetch(new Date());
                } else if (response?.quota_reset_at) {
                  const resetTime = new Date(response.quota_reset_at);
                  console.log(`YouTube quota limited. Full service will resume at ${resetTime.toLocaleString()}`);
                }
              }
            } catch (invocationError) {
              console.error('Failed to invoke function:', invocationError);
              setFetchAttempts(prev => prev + 1);
              // Continue with existing data
            }
          }
        } catch (quotaError) {
          console.error('Error checking quota:', quotaError);
          // Continue with existing data if quota check fails
        }
      }

      // Format and return the data, even if the fetch failed
      const formattedData = videosData.map(video => ({
        id: video.id,
        video_id: video.video_id,
        title: video.title,
        thumbnail: video.thumbnail,
        channelName: video.channel_name,
        channelId: video.channel_id,
        views: video.views || 0,
        uploadedAt: video.uploaded_at
      }));

      console.log(`Successfully processed ${formattedData.length} videos`);
      return formattedData;

    } catch (error: any) {
      console.error("Error in video fetching process:", error);
      // For any errors, return what we already have instead of throwing
      if (videosData.length > 0) {
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
      }
      
      return [];
    }
  };

  return {
    fetchAllVideos,
    fetchAttempts,
    lastSuccessfulFetch,
    setFetchAttempts,
    setLastSuccessfulFetch
  };
};
