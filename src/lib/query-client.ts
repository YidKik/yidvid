
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true,
    },
  },
});

/**
 * Clears all application cache, including React Query cache and relevant 
 * local storage items. Use this when data seems stale or outdated.
 */
export const clearApplicationCache = async () => {
  console.log("Clearing application cache...");
  
  // Clear all React Query cache
  await queryClient.clear();
  console.log("React Query cache cleared");
  
  // Clear any local storage cache items
  const cacheKeys = [
    'videoHistory',
    'lastViewedVideos',
    'userPreferences',
    'lastRefreshTime',
    'cachedVideos',
    'cachedChannels'
  ];
  
  cacheKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`Cleared localStorage item: ${key}`);
    }
  });
  
  // Force refetch of main content
  await queryClient.invalidateQueries({ queryKey: ["youtube_videos"] });
  await queryClient.invalidateQueries({ queryKey: ["youtube_channels"] });
  
  console.log("Cache clearing complete. Main content will be refreshed.");
  
  return true;
};
