
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useHiddenChannels } from "@/hooks/channel/useHiddenChannels";
import { formatVideoData } from "./utils/database";
import { VideoData } from "./types/video-fetcher";

const fetchAllShorts = async (): Promise<VideoData[]> => {
  const { data, error } = await supabase
    .from("youtube_videos")
    .select(`
      id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, updated_at, category, description,
      youtube_channels(thumbnail_url)
    `)
    .is("deleted_at", null)
    .eq("content_analysis_status", "approved")
    .eq("is_short", true)
    .order("views", { ascending: false })
    .limit(200);

  if (error) throw error;
  return data ? formatVideoData(data) : [];
};

export const useShortsNavigation = (initialVideoId?: string) => {
  const { filterVideos, hiddenChannelIds } = useHiddenChannels();

  const { data: rawShorts = [], isLoading } = useQuery({
    queryKey: ["shorts-viewer", hiddenChannelIds.size],
    queryFn: fetchAllShorts,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const shorts = useMemo(() => filterVideos(rawShorts), [rawShorts, filterVideos, hiddenChannelIds.size]);

  const currentIndex = useMemo(() => {
    if (!initialVideoId) return 0;
    const idx = shorts.findIndex(s => s.video_id === initialVideoId);
    return idx >= 0 ? idx : 0;
  }, [shorts, initialVideoId]);

  return { shorts, isLoading, currentIndex };
};
