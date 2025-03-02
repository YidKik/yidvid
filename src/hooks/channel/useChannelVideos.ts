
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

      console.log("Fetching initial videos for channel:", channelId);

      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .eq("channel_id", channelId)
        .is("deleted_at", null)
        .order("uploaded_at", { ascending: false })
        .limit(INITIAL_VIDEOS_COUNT);

      if (error) {
        console.error("Error fetching initial videos:", error);
        toast.error("Failed to load videos");
        throw error;
      }

      console.log(`Successfully fetched ${data?.length || 0} initial videos`);
      return data || [];
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const { data: allVideos } = useQuery({
    queryKey: ["all-channel-videos", channelId],
    queryFn: async () => {
      if (!channelId) throw new Error("Channel ID is required");

      console.log("Fetching all videos for channel:", channelId);

      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .eq("channel_id", channelId)
        .is("deleted_at", null)
        .order("uploaded_at", { ascending: false });

      if (error) {
        console.error("Error fetching all videos:", error);
        return initialVideos || [];
      }

      console.log(`Successfully fetched ${data?.length || 0} total videos`);
      return data || [];
    },
    enabled: !!channelId && !!initialVideos && initialVideos.length > 0,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (initialVideos?.length) {
      setDisplayedVideos(initialVideos);
      console.log("Set displayed videos from initial videos:", initialVideos.length);
    } else if (initialVideos?.length === 0) {
      console.log("No videos found for channel:", channelId);
      setDisplayedVideos([]);
    }
  }, [initialVideos, channelId]);

  useEffect(() => {
    if (allVideos && allVideos.length > INITIAL_VIDEOS_COUNT) {
      setIsLoadingMore(true);
      console.log("Loading more videos...");
      
      const timer = setTimeout(() => {
        setDisplayedVideos(allVideos);
        setIsLoadingMore(false);
        console.log("All videos loaded:", allVideos.length);
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
