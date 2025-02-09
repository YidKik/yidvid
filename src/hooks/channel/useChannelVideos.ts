
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const INITIAL_VIDEOS_COUNT = 6;

export const useChannelVideos = (channelId: string | undefined) => {
  const [displayedVideos, setDisplayedVideos] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { data: initialVideos, isLoading: isLoadingInitialVideos } = useQuery({
    queryKey: ["initial-channel-videos", channelId],
    queryFn: async () => {
      if (!channelId) throw new Error("Channel ID is required");

      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .eq("channel_id", channelId)
        .order("uploaded_at", { ascending: false })
        .limit(INITIAL_VIDEOS_COUNT);

      if (error) {
        console.error("Error fetching initial videos:", error);
        toast.error("Failed to load videos");
        throw error;
      }

      return data || [];
    },
  });

  const { data: allVideos } = useQuery({
    queryKey: ["all-channel-videos", channelId],
    queryFn: async () => {
      if (!channelId) throw new Error("Channel ID is required");

      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .eq("channel_id", channelId)
        .order("uploaded_at", { ascending: false });

      if (error) {
        console.error("Error fetching all videos:", error);
        return initialVideos || [];
      }

      return data || [];
    },
    enabled: !!channelId && !!initialVideos,
  });

  useEffect(() => {
    if (initialVideos) {
      setDisplayedVideos(initialVideos);
    }
  }, [initialVideos]);

  useEffect(() => {
    if (allVideos && allVideos.length > INITIAL_VIDEOS_COUNT) {
      setIsLoadingMore(true);
      const timer = setTimeout(() => {
        setDisplayedVideos(allVideos);
        setIsLoadingMore(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [allVideos]);

  return {
    displayedVideos,
    isLoadingInitialVideos,
    isLoadingMore,
    INITIAL_VIDEOS_COUNT,
  };
};
