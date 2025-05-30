
import { useQuery } from "@tanstack/react-query";
import { useVideoFetcher } from "./useVideoFetcher";
import { useRefetchControl } from "./useRefetchControl";
import { useAuthStateListener } from "./useAuthStateListener";
import { VideoData } from "./types/video-fetcher";

export const useVideos = (category?: string) => {
  const { fetchAllVideos, forceRefetch, fetchAttempts, lastSuccessfulFetch } = useVideoFetcher();
  const { shouldAllowRefetch } = useRefetchControl();
  
  useAuthStateListener();

  const query = useQuery({
    queryKey: ["videos", category],
    queryFn: async () => {
      const allVideos = await fetchAllVideos();
      
      // Filter by category if specified
      if (category && category !== "all") {
        return allVideos.filter((video: VideoData) => video.category === category);
      }
      
      return allVideos;
    },
    refetchInterval: shouldAllowRefetch ? 5 * 60 * 1000 : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    ...query,
    forceRefetch,
    fetchAttempts,
    lastSuccessfulFetch
  };
};
