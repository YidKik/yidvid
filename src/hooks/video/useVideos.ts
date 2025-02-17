
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

  const { data, isLoading, isFetching, error } = useQuery<Video[]>({
    queryKey: ["youtube_videos"],
    queryFn: async () => {
      console.log("Fetching videos...");
      
      try {
        const { data: quotaData } = await supabase
          .from('api_quota_tracking')
          .select('quota_remaining, quota_reset_at')
          .eq('api_name', 'youtube')
          .single();

        if (quotaData?.quota_remaining <= 0) {
          console.warn('YouTube API quota exceeded, fetching cached data only');
          toast.warning("API quota exceeded. Showing cached data until reset.");
        }

        const { data, error } = await supabase
          .from("youtube_videos")
          .select("*")
          .is('deleted_at', null)
          .order("uploaded_at", { ascending: false });

        if (error) {
          console.error("Error fetching videos:", error);
          throw error;
        }

        if (!data) {
          console.log("No videos found");
          return [];
        }

        const formattedData = data.map(video => ({
          id: video.id,
          video_id: video.video_id,
          title: video.title,
          thumbnail: video.thumbnail,
          channelName: video.channel_name,
          channelId: video.channel_id,
          views: video.views || 0,
          uploadedAt: video.uploaded_at
        }));

        console.log(`Successfully fetched ${formattedData.length} videos`);
        
        // Cache the data for the video grid
        queryClient.setQueryData(["youtube_videos_grid"], formattedData);
        
        return formattedData;
      } catch (error: any) {
        console.error("Error details:", error);

        // Handle YouTube API quota exceeded
        if (error.message?.includes('quota exceeded') || error?.status === 429) {
          // Try to get cached data
          const cachedData = queryClient.getQueryData<Video[]>(["youtube_videos"]);
          if (cachedData?.length) {
            toast.warning('API quota exceeded. Showing cached data.');
            return cachedData;
          }
          
          // If no cached data, get from database only
          const { data: dbData } = await supabase
            .from("youtube_videos")
            .select("*")
            .is('deleted_at', null)
            .order("uploaded_at", { ascending: false });

          if (dbData) {
            return dbData.map(video => ({
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
        }

        // Handle network errors
        if (error.message?.includes('Failed to fetch') || error.code === 'ECONNABORTED') {
          console.error('Network error:', error);
          toast.error('Network error. Please check your connection.');
          // Try to get cached data
          const cachedData = queryClient.getQueryData<Video[]>(["youtube_videos"]);
          if (cachedData?.length) {
            return cachedData;
          }
        }

        // General error case
        console.error("Unexpected error:", error);
        toast.error('Error loading videos. Please try again later.');
        return [];
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
      toast.error('Error loading videos. Please try again later.');
    }
  }, [error]);

  return {
    data: data || [],
    isLoading,
    isFetching,
    error
  };
};
