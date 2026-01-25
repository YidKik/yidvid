
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useVideoFetcher } from "./useVideoFetcher";
import { useRefetchControl } from "./useRefetchControl";
import { useHiddenChannels } from "@/hooks/channel/useHiddenChannels";
import { VideoData } from "./types/video-fetcher";

export const useVideos = (category?: string) => {
  const { fetchAllVideos, forceRefetch, fetchAttempts, lastSuccessfulFetch } = useVideoFetcher();
  const { filterVideos, hiddenChannelIds } = useHiddenChannels();

  const query = useQuery({
    queryKey: ["videos", category],
    queryFn: async () => {
      const allVideos = await fetchAllVideos();
      return allVideos;
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Filter out videos from hidden channels
  const filteredData = useMemo(() => {
    if (!query.data) return [];
    
    const filtered = filterVideos(query.data as VideoData[]);
    
    if (hiddenChannelIds.size > 0) {
      console.log(`Filtered videos: ${query.data.length} -> ${filtered.length} (${hiddenChannelIds.size} channels hidden)`);
    }
    
    return filtered;
  }, [query.data, filterVideos, hiddenChannelIds]);

  const { isRefreshing, handleRefetch, handleForceRefetch } = useRefetchControl({
    refetch: query.refetch,
    forceRefetch: forceRefetch
  });

  return {
    ...query,
    data: filteredData, // Return filtered data instead of raw data
    forceRefetch: handleForceRefetch,
    fetchAttempts,
    lastSuccessfulFetch,
    isRefreshing
  };
};
