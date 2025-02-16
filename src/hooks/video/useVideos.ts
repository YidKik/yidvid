
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

  useEffect(() => {
    const prefetchVideos = async () => {
      console.log("Starting video prefetch...");
      try {
        const { data, error } = await supabase
          .from("youtube_videos")
          .select("*")
          .is('deleted_at', null)
          .order("uploaded_at", { ascending: false });

        if (error) {
          console.error("Error in prefetch:", error);
          throw error;
        }

        if (!data) {
          console.log("No data returned from prefetch");
          return;
        }

        const formattedData: Video[] = data.map(video => ({
          id: video.id,
          video_id: video.video_id,
          title: video.title,
          thumbnail: video.thumbnail,
          channelName: video.channel_name,
          channelId: video.channel_id,
          views: video.views || 0,
          uploadedAt: video.uploaded_at
        }));

        console.log(`Prefetched ${formattedData.length} videos`);
        queryClient.setQueryData(["youtube_videos"], formattedData);
      } catch (error) {
        console.error("Error prefetching videos:", error);
      }
    };

    prefetchVideos();
  }, [queryClient]);

  return useQuery<Video[]>({
    queryKey: ["youtube_videos"],
    queryFn: async () => {
      console.log("Main video fetch starting...");
      try {
        const cachedData = queryClient.getQueryData<Video[]>(["youtube_videos"]);
        if (cachedData && cachedData.length > 0) {
          console.log("Using cached video data:", cachedData.length, "videos");
          return cachedData;
        }

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
          console.log("No data returned from main fetch");
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

        console.log("Fetched videos count:", formattedData.length);
        return formattedData;
      } catch (error) {
        console.error("Error in video fetch:", error);
        toast.error("Failed to load videos");
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 2,
    initialData: [],
  });
};
