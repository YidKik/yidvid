
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useHiddenChannels } from "@/hooks/channel/useHiddenChannels";
import { useMemo } from "react";
import { VideoData } from "./types/video-fetcher";
import { formatVideoData } from "./utils/database";

const fetchShortsFromDB = async (): Promise<VideoData[]> => {
  const { data, error } = await supabase
    .from("youtube_videos")
    .select(`
      id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, updated_at, category, description,
      youtube_channels(thumbnail_url)
    `)
    .is("deleted_at", null)
    .eq("content_analysis_status", "approved")
    .eq("is_short", true)
    .order("uploaded_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Error fetching shorts:", error);
    throw error;
  }

  return data ? formatVideoData(data) : [];
};

export const useShorts = () => {
  const { filterVideos, hiddenChannelIds } = useHiddenChannels();

  const query = useQuery({
    queryKey: ["shorts", hiddenChannelIds.size],
    queryFn: fetchShortsFromDB,
    staleTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const filteredData = useMemo(() => {
    if (!query.data || !Array.isArray(query.data)) return [];
    return filterVideos(query.data);
  }, [query.data, filterVideos, hiddenChannelIds.size]);

  return {
    shorts: filteredData,
    isLoading: query.isLoading,
    error: query.error,
  };
};
