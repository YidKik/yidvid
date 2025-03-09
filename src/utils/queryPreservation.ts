
import { QueryClient } from "@tanstack/react-query";

/**
 * Preserves content data during auth state changes to prevent UI flashing
 */
export const preserveContentData = (queryClient: QueryClient) => {
  // Save references to content data that should be preserved
  const videosData = queryClient.getQueryData(["youtube_videos"]);
  const channelsData = queryClient.getQueryData(["youtube_channels"]);
  
  // Log what we're preserving
  if (videosData) {
    console.log("Preserving videos data during auth change, count:", Array.isArray(videosData) ? videosData.length : 'unknown');
  }
  
  if (channelsData) {
    console.log("Preserving channels data during auth change, count:", Array.isArray(channelsData) ? channelsData.length : 'unknown');
  }
  
  // Return a function that will restore this data
  return () => {
    if (videosData) {
      console.log("Restoring videos data after auth change, count:", Array.isArray(videosData) ? videosData.length : 'unknown');
      queryClient.setQueryData(["youtube_videos"], videosData);
    }
    
    if (channelsData) {
      console.log("Restoring channels data after auth change, count:", Array.isArray(channelsData) ? channelsData.length : 'unknown');
      queryClient.setQueryData(["youtube_channels"], channelsData);
    }
  };
};

/**
 * Refreshes content data after auth state changes with a delay
 */
export const refreshContentAfterDelay = (queryClient: QueryClient, delay = 2000) => {
  setTimeout(() => {
    console.log("Refreshing content data after auth state change");
    
    // Invalidate only content-related queries
    queryClient.invalidateQueries({ queryKey: ["youtube_videos"] });
    queryClient.invalidateQueries({ queryKey: ["youtube_channels"] });
    
    // Force immediate refresh if we have no data
    if (!queryClient.getQueryData(["youtube_videos"])) {
      queryClient.fetchQuery({ queryKey: ["youtube_videos"] });
    }
    
    if (!queryClient.getQueryData(["youtube_channels"])) {
      queryClient.fetchQuery({ queryKey: ["youtube_channels"] });
    }
  }, delay);
};
