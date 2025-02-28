
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
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
      // First fetch existing videos from database
      let videosData = [];
      const { data: initialData, error: dbError } = await supabase
        .from("youtube_videos")
        .select("*")
        .is('deleted_at', null)
        .order("uploaded_at", { ascending: false });

      if (dbError) {
        console.error("Error fetching videos from database:", dbError);
        throw dbError;
      }

      videosData = initialData || [];

      // Get all active channels
      const { data: channels, error: channelError } = await supabase
        .from("youtube_channels")
        .select("channel_id")
        .is("deleted_at", null);

      if (channelError) {
        console.error("Error fetching channels:", channelError);
        throw channelError;
      }

      const channelIds = channels?.map(c => c.channel_id) || [];
      console.log(`Found ${channelIds.length} channels to process`);

      // Check if we have recent video data or need to fetch fresh data
      const shouldFetchNewVideos = lastSuccessfulFetch === null || 
                               (Date.now() - lastSuccessfulFetch.getTime() > 3600000) || // 1 hour
                               fetchAttempts > 0; // Also fetch if we've had previous attempts

      if (channelIds.length > 0 && shouldFetchNewVideos) {
        // Check quota before making requests
        const quotaInfo = await checkApiQuota();
        
        if (quotaInfo && quotaInfo.quota_remaining <= 0) {
          const resetTime = new Date(quotaInfo.quota_reset_at);
          toast.warning(`YouTube quota exceeded. Service will resume at ${resetTime.toLocaleString()}`);
        } else {
          try {
            // Trigger edge function to fetch new videos
            const { data: response, error: fetchError } = await supabase.functions.invoke('fetch-youtube-videos', {
              body: { 
                channels: channelIds,
                forceUpdate: fetchAttempts > 2, // Force update if we've had multiple attempts
                fullScan: true // Add parameter to force full scan of channels for missed videos
              }
            });

            if (fetchError) {
              console.error('Error invoking fetch-youtube-videos:', fetchError);
              setFetchAttempts(prev => prev + 1);
              
              // Continue with existing data rather than failing completely
              console.log('Using existing video data due to fetch error');
            } else {
              console.log('Fetch response:', response);
              setFetchAttempts(0);
              setLastSuccessfulFetch(new Date());

              if (response?.success) {
                toast.success(`Successfully processed ${response.processed} channels, found ${response.newVideos} new videos`);
                
                // Refetch videos after successful update
                const { data: updatedData, error: updateError } = await supabase
                  .from("youtube_videos")
                  .select("*")
                  .is('deleted_at', null)
                  .order("uploaded_at", { ascending: false });

                if (updateError) {
                  console.error('Error fetching updated videos:', updateError);
                } else if (updatedData) {
                  videosData = updatedData;
                }
              } else if (response?.quota_reset_at) {
                const resetTime = new Date(response.quota_reset_at);
                toast.warning(`YouTube quota exceeded. Service will resume at ${resetTime.toLocaleString()}`);
              }
            }
          } catch (invocationError) {
            console.error('Failed to invoke function:', invocationError);
            setFetchAttempts(prev => prev + 1);
            // Continue with existing data
          }
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
      toast.error('Error loading videos. Please try again later.');
      throw error;
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
