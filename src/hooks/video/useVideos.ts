
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
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }
        
        if (!session) {
          console.log("No session found, waiting for authentication");
          return [];
        }

        const { data, error } = await supabase
          .from("youtube_videos")
          .select("*")
          .is('deleted_at', null)
          .order("uploaded_at", { ascending: false })
          .throwOnError(); // This will throw on RLS or network errors

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
        // Handle network errors specifically
        if (error.message === 'Failed to fetch') {
          console.error('Network error occurred:', error);
          toast.error('Network error. Please check your connection and try again.');
        } else {
          console.error("Error in video fetch:", error);
          toast.error("There was a problem loading the videos. Please try refreshing the page.");
        }
        throw error;
      }
    },
    enabled: true,
    staleTime: 1000 * 60 * 5, // Keep data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Cache data for 30 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors, but retry up to 3 times on network errors
      if (error?.status === 401 || error?.status === 403) return false;
      return failureCount < 3;
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
