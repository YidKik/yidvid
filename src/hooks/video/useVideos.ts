
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
        // Always fetch from database first
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

        // Check quota before attempting to fetch new videos
        const { data: quotaData } = await supabase
          .from('api_quota_tracking')
          .select('quota_remaining, quota_reset_at')
          .eq('api_name', 'youtube')
          .single();

        // If quota is available, try to fetch new videos
        if (!quotaData || quotaData.quota_remaining > 0) {
          try {
            await supabase.functions.invoke('fetch-youtube-videos').catch(error => {
              // Handle quota exceeded error (status 429)
              if (error.status === 429) {
                try {
                  const errorBody = JSON.parse(error.body);
                  const resetTime = new Date(errorBody.quota_reset_at);
                  const message = `YouTube quota exceeded. Service will resume at ${resetTime.toLocaleString()}`;
                  console.warn(message);
                  toast.warning(message);
                } catch (parseError) {
                  console.error('Error parsing quota response:', parseError);
                }
                // Don't throw the error, just log it
                return;
              }
              // For other errors, throw them to be caught by the outer try-catch
              throw error;
            });
          } catch (error: any) {
            // Only show error toast for non-quota errors
            if (error.status !== 429) {
              console.error('Failed to invoke edge function:', error);
              toast.error('Error checking for new videos');
            }
          }
        } else if (quotaData) {
          // If quota is depleted, show a toast with the reset time
          const resetTime = new Date(quotaData.quota_reset_at);
          toast.warning(`YouTube quota exceeded. Service will resume at ${resetTime.toLocaleString()}`);
        }

        // Cache the formatted data
        queryClient.setQueryData(["youtube_videos_grid"], formattedData);
        
        // Always return the database data, even if fetching new videos failed
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

  return {
    data: data || [],
    isLoading,
    isFetching,
    error
  };
};
