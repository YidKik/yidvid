
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
        
        // Update both query caches
        queryClient.setQueryData(["youtube_videos_grid"], formattedData);
        
        return formattedData;
      } catch (error: any) {
        // Log the full error for debugging
        console.error("Full error details:", error);

        // Handle fetch errors specifically
        if (error.message?.includes('Failed to fetch') || error.code === 'ECONNABORTED') {
          console.error('Network error occurred:', error);
          toast.error('Network error. Please check your connection and try again.');
          return []; // Return empty array instead of throwing
        }

        // Handle Supabase errors
        if (error.code?.startsWith('2')) { // Supabase error codes
          console.error('Database error:', error);
          toast.error('Database error. Please try again later.');
          return []; // Return empty array instead of throwing
        }

        // Handle Edge function errors
        if (error.message?.includes('Edge Function')) {
          console.error('Edge function error:', error);
          toast.error('Unable to fetch new videos at the moment. Showing cached data.');
          return []; // Return empty array to show cached data
        }

        console.error("Unexpected error in video fetch:", error);
        toast.error("There was a problem loading the videos. Please try refreshing the page.");
        return []; // Return empty array as fallback
      }
    },
    enabled: true,
    staleTime: 1000 * 60 * 5, // Keep data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Cache data for 30 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.status === 401 || error?.status === 403) return false;
      // Retry up to 3 times on network errors
      if (error.message?.includes('Failed to fetch')) return failureCount < 3;
      // Retry once for other errors
      return failureCount < 1;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
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
