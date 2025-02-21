
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
        // First trigger an immediate fetch of new videos
        const { data: response, error: fetchError } = await supabase.functions.invoke('fetch-youtube-videos', {
          body: { forceUpdate: true }
        });
        
        if (fetchError) {
          console.error('Error invoking fetch-youtube-videos:', fetchError);
          toast.error('Error fetching new videos');
        } else if (response && !response.success) {
          console.error('Fetch videos response error:', response);
          if (response.quota_reset_at) {
            const resetTime = new Date(response.quota_reset_at);
            toast.warning(`YouTube quota exceeded. Service will resume at ${resetTime.toLocaleString()}`);
          }
        } else if (response?.success) {
          toast.success(`Successfully processed ${response.processed} channels, found ${response.newVideos} new videos`);
        }

        // Always fetch from database after attempting to get new videos
        const { data: dbData, error: dbError } = await supabase
          .from("youtube_videos")
          .select("*")
          .is('deleted_at', null)
          .order("uploaded_at", { ascending: false });

        if (dbError) {
          console.error("Error fetching videos from database:", dbError);
          throw dbError;
        }

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

        console.log(`Successfully fetched ${formattedData.length} videos from database`);

        // Cache the formatted data
        queryClient.setQueryData(["youtube_videos_grid"], formattedData);
        
        return formattedData;

      } catch (error: any) {
        console.error("Error fetching videos:", error);

        // Try to get cached data first
        const cachedData = queryClient.getQueryData<Video[]>(["youtube_videos"]);
        if (cachedData?.length) {
          toast.warning('Error fetching new videos. Showing cached data.');
          return cachedData;
        }

        // If all else fails
        toast.error('Error loading videos. Please try again later.');
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // Keep data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Cache data for 30 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on quota exceeded
      if (error?.status === 429) return false;
      // Retry other errors up to 3 times
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * (2 ** attemptIndex), 30000), // Exponential backoff
  });

  useEffect(() => {
    if (error) {
      console.error("Video fetch error:", error);
    }
  }, [error]);

  // Force an immediate refetch
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
