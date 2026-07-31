
import { useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useHiddenChannels } from "@/hooks/channel/useHiddenChannels";
import { formatVideoData } from "./utils/database";
import { VideoData } from "./types/video-fetcher";

const SELECT_FIELDS = `
  id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, updated_at, category, description,
  youtube_channels(thumbnail_url)
`;

const fetchAllShorts = async (): Promise<VideoData[]> => {
  const { data, error } = await supabase
    .from("youtube_videos")
    .select(SELECT_FIELDS)
    .is("deleted_at", null)
    .eq("content_analysis_status", "approved")
    .eq("is_short", true)
    .order("uploaded_at", { ascending: false })
    .limit(300);

  if (error) throw error;
  return data ? formatVideoData(data) : [];
};

const fetchSingleShort = async (videoId: string): Promise<VideoData | null> => {
  const { data, error } = await supabase
    .from("youtube_videos")
    .select(SELECT_FIELDS)
    .eq("video_id", videoId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) return null;
  return formatVideoData([data])[0] ?? null;
};

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const useShortsNavigation = (initialVideoId?: string) => {
  const { filterVideos, hiddenChannelIds } = useHiddenChannels();

  // Freeze the short the user clicked on — the URL changes as they scroll,
  // and reordering the playlist mid-session would jump them around.
  const startIdRef = useRef<string | undefined>(initialVideoId);
  if (startIdRef.current === undefined && initialVideoId) {
    startIdRef.current = initialVideoId;
  }
  const startId = startIdRef.current;

  const { data: rawShorts = [], isLoading: isLoadingList } = useQuery({
    queryKey: ["shorts-viewer", hiddenChannelIds.size],
    queryFn: fetchAllShorts,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Guarantees the clicked short is available even if it's filtered out of the list query.
  const { data: startShort = null, isLoading: isLoadingStart } = useQuery({
    queryKey: ["shorts-viewer-single", startId],
    queryFn: () => fetchSingleShort(startId as string),
    enabled: !!startId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const shorts = useMemo(() => {
    const visible = filterVideos(rawShorts) as VideoData[];
    const rest = shuffle(visible.filter((s) => s.video_id !== startId));

    if (!startId) return visible;

    const first =
      visible.find((s) => s.video_id === startId) ||
      rawShorts.find((s) => s.video_id === startId) ||
      startShort;

    return first ? [first, ...rest] : rest;
    // Intentionally recompute only when the underlying data set changes,
    // not when the URL id changes while scrolling.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawShorts, startShort, startId, hiddenChannelIds.size]);

  return {
    shorts,
    isLoading: isLoadingList || (!!startId && isLoadingStart),
    currentIndex: 0,
  };
};
