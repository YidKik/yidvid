
import { useMemo, useCallback, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useHiddenChannels } from "@/hooks/channel/useHiddenChannels";
import { VideoData } from "./types/video-fetcher";
import { formatVideoData } from "./utils/database";
import { toast } from "sonner";

// Stable fetch function outside the hook to prevent recreation
const fetchVideosFromDB = async (): Promise<VideoData[]> => {
  const { data, error } = await supabase
    .from("youtube_videos")
    .select(`
      id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, updated_at, category, description,
      youtube_channels(thumbnail_url)
    `)
    .is("deleted_at", null)
    .eq("content_analysis_status", "approved")
    .order("uploaded_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("Error fetching videos:", error);
    throw error;
  }

  if (!data || data.length === 0) {
    return [];
  }

  return formatVideoData(data);
};

export const useVideos = () => {
  const fetchAttemptsRef = useRef(0);
  const lastSuccessfulFetchRef = useRef<Date | null>(null);
  const isRefreshingRef = useRef(false);
  
  const { filterVideos, hiddenChannelIds } = useHiddenChannels();

  const query = useQuery({
    queryKey: ["videos", hiddenChannelIds.size],
    queryFn: fetchVideosFromDB,
    refetchInterval: 5 * 60 * 1000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    staleTime: 3 * 60 * 1000, // Increased from 2 to 3 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  useEffect(() => {
    if (query.data && query.data.length > 0 && !query.isFetching) {
      lastSuccessfulFetchRef.current = new Date();
      fetchAttemptsRef.current = 0;
    }
  }, [query.data, query.isFetching]);

  // Filter out videos from hidden channels
  const filteredData = useMemo(() => {
    if (!query.data || !Array.isArray(query.data)) return [];
    return filterVideos(query.data);
  }, [query.data, filterVideos, hiddenChannelIds.size]);

  const handleRefetch = useCallback(async () => {
    isRefreshingRef.current = true;
    try {
      await query.refetch();
    } finally {
      isRefreshingRef.current = false;
    }
  }, [query]);

  const handleForceRefetch = useCallback(async () => {
    isRefreshingRef.current = true;
    try {
      const lastRefetch = localStorage.getItem('lastForceRefetch');
      const now = Date.now();
      if (lastRefetch && (now - parseInt(lastRefetch)) < 600000) {
        return [];
      }
      localStorage.setItem('lastForceRefetch', now.toString());
      
      const result = await query.refetch();
      return result.data || [];
    } catch (err: any) {
      console.error("Error in force refetch:", err);
      fetchAttemptsRef.current += 1;
      
      if (err.message && err.message !== "No videos found") {
        toast.error("Failed to refresh content", {
          description: err.message,
          duration: 5000
        });
      }
      return [];
    } finally {
      isRefreshingRef.current = false;
    }
  }, [query]);

  return {
    ...query,
    data: filteredData,
    refetch: handleRefetch,
    forceRefetch: handleForceRefetch,
    fetchAttempts: fetchAttemptsRef.current,
    lastSuccessfulFetch: lastSuccessfulFetchRef.current,
    isRefreshing: query.isFetching
  };
};
