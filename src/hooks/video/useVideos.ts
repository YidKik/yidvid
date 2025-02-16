
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

  // Prefetch the videos during initial load
  const { data, isLoading, isFetching, error } = useQuery<Video[]>({
    queryKey: ["youtube_videos"],
    queryFn: async () => {
      console.log("Fetching videos...");
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No session found, user needs to authenticate");
        return [];
      }

      try {
        const { data, error } = await supabase
          .from("youtube_videos")
          .select("*")
          .is('deleted_at', null)
          .order("uploaded_at", { ascending: false });

        if (error) {
          console.error("Error fetching videos:", error);
          toast.error("Failed to load videos");
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
      } catch (error) {
        console.error("Error in video fetch:", error);
        toast.error("Failed to load videos");
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // Keep data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Cache data for 30 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // Handle any errors in the query
  useEffect(() => {
    if (error) {
      console.error("Video fetch error:", error);
      toast.error("There was a problem loading the videos. Please try refreshing the page.");
    }
  }, [error]);

  return {
    data,
    isLoading,
    isFetching,
    error
  };
};
