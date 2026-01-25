
import { useMemo, useCallback, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useHiddenChannels } from "@/hooks/channel/useHiddenChannels";
import { VideoData } from "./types/video-fetcher";
import { formatVideoData } from "./utils/database";
import { toast } from "sonner";

// Stable fetch function outside the hook to prevent recreation
const fetchVideosFromDB = async (): Promise<VideoData[]> => {
  console.log("Fetching all videos");
  
  const { data, error } = await supabase
    .from("youtube_videos")
    .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, updated_at, category, description")
    .is("deleted_at", null)
    .eq("content_analysis_status", "approved")
    .order("uploaded_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("Error fetching videos:", error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.log("No videos found in database");
    return [];
  }

  console.log(`Successfully fetched ${data.length} videos from database`);
  return formatVideoData(data);
};

export const useVideos = () => {
  // Use refs to track state without causing re-renders or hook issues
  const fetchAttemptsRef = useRef(0);
  const lastSuccessfulFetchRef = useRef<Date | null>(null);
  const isRefreshingRef = useRef(false);
  
  // Get hidden channels filter - this hook is stable
  const { filterVideos, hiddenChannelIds } = useHiddenChannels();

  // Main query - single useQuery call
  const query = useQuery({
    queryKey: ["videos"],
    queryFn: fetchVideosFromDB,
    refetchInterval: 5 * 60 * 1000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Track successful fetches using useEffect (proper side effect handling)
  useEffect(() => {
    if (query.data && query.data.length > 0 && !query.isFetching) {
      lastSuccessfulFetchRef.current = new Date();
      fetchAttemptsRef.current = 0;
    }
  }, [query.data, query.isFetching]);

  // Filter out videos from hidden channels - pure computation
  const filteredData = useMemo(() => {
    if (!query.data || !Array.isArray(query.data)) return [];
    
    const filtered = filterVideos(query.data);
    
    if (hiddenChannelIds.size > 0 && query.data.length > 0) {
      console.log(`Filtered videos: ${query.data.length} -> ${filtered.length} (${hiddenChannelIds.size} channels hidden)`);
    }
    
    return filtered;
  }, [query.data, filterVideos, hiddenChannelIds.size]);

  // Stable refetch handler
  const handleRefetch = useCallback(async () => {
    isRefreshingRef.current = true;
    try {
      await query.refetch();
    } finally {
      isRefreshingRef.current = false;
    }
  }, [query]);

  // Stable force refetch handler
  const handleForceRefetch = useCallback(async () => {
    isRefreshingRef.current = true;
    try {
      // Rate limiting
      const lastRefetch = localStorage.getItem('lastForceRefetch');
      const now = Date.now();
      if (lastRefetch && (now - parseInt(lastRefetch)) < 600000) {
        console.log("Skipping refetch - too recent");
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
