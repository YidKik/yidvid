
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
        }

        const { data, error } = await supabase
          .from("youtube_videos")
          .select("*")
          .is('deleted_at', null)
          .order("uploaded_at", { ascending: false })
          .throwOnError();

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
        queryClient.setQueryData(["youtube_videos_grid"], formattedData);
        
        return formattedData;
      } catch (error: any) {
        if (error.message?.includes('quota exceeded') || error?.status === 429) {
          toast.warning('YouTube API quota exceeded. Showing cached data.');
          return [];
        }

        if (error.message?.includes('Failed to fetch') || error.code === 'ECONNABORTED') {
          console.error('Network error:', error);
          toast.error('Network error. Please check your connection.');
          return [];
        }

        console.error("Unexpected error:", error);
        toast.error('Error loading videos. Please try again later.');
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // Keep data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Cache data for 30 minutes
  });

  // Handle any errors in the query
  useEffect(() => {
    if (error) {
      console.error("Video fetch error:", error);
    }
  }, [error]);

  return {
    data: data || [],
    isLoading,
    isFetching,
    error
  };
};
