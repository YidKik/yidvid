
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
        // First try to fetch from edge function
        try {
          const { error: quotaError } = await supabase
            .from('api_quota_tracking')
            .select('quota_remaining, quota_reset_at')
            .eq('api_name', 'youtube')
            .single();

          if (quotaError) {
            console.error("Error checking quota:", quotaError);
          }

          await supabase.functions.invoke('fetch-youtube-videos');
        } catch (edgeFunctionError: any) {
          console.log('Edge function response:', edgeFunctionError);
          
          // Parse the error body if it's a string
          let errorBody;
          try {
            errorBody = typeof edgeFunctionError.body === 'string' 
              ? JSON.parse(edgeFunctionError.body)
              : edgeFunctionError.body;
          } catch (e) {
            console.error('Error parsing error body:', e);
          }

          // If it's a quota exceeded error, show the reset time
          if (edgeFunctionError.status === 429 && errorBody?.quota_reset_at) {
            const resetTime = new Date(errorBody.quota_reset_at);
            const message = `Service will resume at ${resetTime.toLocaleString()}`;
            console.warn("YouTube API quota exceeded.", message);
            toast.warning(message);
          }
        }

        // Always fetch from database regardless of edge function result
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

        // Try to get cached data first
        const cachedData = queryClient.getQueryData<Video[]>(["youtube_videos"]);
        if (cachedData?.length) {
          toast.warning('Error fetching new videos. Showing cached data.');
          return cachedData;
        }

        // If no cached data, try to fetch from database directly
        try {
          const { data: dbData } = await supabase
            .from("youtube_videos")
            .select("*")
            .is('deleted_at', null)
            .order("uploaded_at", { ascending: false });

          if (dbData) {
            const formattedData = dbData.map(video => ({
              id: video.id,
              video_id: video.video_id,
              title: video.title,
              thumbnail: video.thumbnail,
              channelName: video.channel_name,
              channelId: video.channel_id,
              views: video.views || 0,
              uploadedAt: video.uploaded_at
            }));
            
            toast.warning('Error fetching new videos. Showing existing videos.');
            return formattedData;
          }
        } catch (dbError) {
          console.error("Database fetch error:", dbError);
        }

        // If all else fails
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
    }
  }, [error]);

  return {
    data: data || [],
    isLoading,
    isFetching,
    error
  };
};
