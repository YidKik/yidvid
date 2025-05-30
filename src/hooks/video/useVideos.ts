
import { useQuery } from "@tanstack/react-query";
import { useVideoFetcher } from "./useVideoFetcher";
import { useRefetchControl } from "./useRefetchControl";
import { VideoData } from "./types/video-fetcher";

export const useVideos = (category?: string) => {
  const { fetchAllVideos, forceRefetch, fetchAttempts, lastSuccessfulFetch } = useVideoFetcher();

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

  const { isRefreshing, handleRefetch, handleForceRefetch } = useRefetchControl({
    refetch: query.refetch,
    forceRefetch: forceRefetch
  });

  return {
    ...query,
    forceRefetch: handleForceRefetch,
    fetchAttempts,
    lastSuccessfulFetch,
    isRefreshing
  };
};
