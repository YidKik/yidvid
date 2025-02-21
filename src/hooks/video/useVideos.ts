
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { toast } from "sonner";

interface Video {
  id: string;
  video_id: string;
  title: string;
  thumbnail: string;
  channelName: string;
  channelId: string;
  views: number;
  uploadedAt: string | Date;
}

export const useVideos = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, error, refetch } = useQuery<Video[]>({
    queryKey: ["youtube_videos"],
    queryFn: async () => {
      console.log("Fetching videos...");
      
      try {
        // First fetch existing videos from database
        const { data: dbData, error: dbError } = await supabase
          .from("youtube_videos")
          .select("*")
          .is('deleted_at', null)
          .order("uploaded_at", { ascending: false });

        if (dbError) {
          console.error("Error fetching videos from database:", dbError);
          throw dbError;
        }

        // Get channels to process
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

        // Try to fetch new videos
        try {
          const { data: response } = await supabase.functions.invoke('fetch-youtube-videos', {
            body: { 
              channels: channelIds,
              forceUpdate: true
            }
          });

          if (response?.success) {
            toast.success(`Successfully processed ${response.processed} channels, found ${response.newVideos} new videos`);
            
            // Refetch videos from database after successful update
            const { data: updatedData, error: updateError } = await supabase
              .from("youtube_videos")
              .select("*")
              .is('deleted_at', null)
              .order("uploaded_at", { ascending: false });

            if (!updateError && updatedData) {
              dbData = updatedData;
            }
          } else if (response?.quota_reset_at) {
            const resetTime = new Date(response.quota_reset_at);
            toast.warning(`YouTube quota exceeded. Service will resume at ${resetTime.toLocaleString()}`);
          }
        } catch (fetchError) {
          console.error('Error fetching new videos:', fetchError);
          toast.error('Could not fetch new videos, showing existing data');
        }

        // Format and return the data we have
        const formattedData = (dbData || []).map(video => ({
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

        // Cache the formatted data
        queryClient.setQueryData(["youtube_videos_grid"], formattedData);
        
        return formattedData;

      } catch (error: any) {
        console.error("Error in video fetching process:", error);

        // Try to get cached data first
        const cachedData = queryClient.getQueryData<Video[]>(["youtube_videos"]);
        if (cachedData?.length) {
          toast.warning('Error fetching videos. Showing cached data.');
          return cachedData;
        }

        // If all else fails
        toast.error('Error loading videos. Please try again later.');
        throw error;
      }
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 1000 * 60 * 30, // Cache data for 30 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on quota exceeded
      if (error?.status === 429) return false;
      // Retry other errors up to 3 times
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * (2 ** attemptIndex), 30000), // Exponential backoff
  });

  // Force an immediate refetch when the component mounts
  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    data: data || [],
    isLoading,
    isFetching,
    error,
    refetch
  };
};
