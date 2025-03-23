
import { clearApplicationCache } from "@/lib/query-client";

/**
 * Manages the application's cache freshness
 */
export const checkAndClearStaleCache = async (
  lastCacheCheck: Date | null,
  lastSuccessfulFetch: Date | null,
  setLastCacheCheck: (date: Date) => void
): Promise<void> => {
  // Avoid too frequent checks
  const now = new Date();
  if (lastCacheCheck && now.getTime() - lastCacheCheck.getTime() < 10 * 60 * 1000) {
    return; // Skip if we checked in the last 10 minutes
  }
  
  setLastCacheCheck(now);
  
  // Check last successful fetch timestamp
  if (!lastSuccessfulFetch || now.getTime() - lastSuccessfulFetch.getTime() > 60 * 60 * 1000) {
    // Cache is considered stale after 1 hour
    console.log("Cache is stale, automatically clearing...");
    await clearApplicationCache();
  }
};

/**
 * Determines if we should fetch new videos
 */
export const shouldFetchNewVideos = (): boolean => {
  // Always fetch new videos when using this hook
  return true;
};

/**
 * Creates sample video data when no real data is available
 */
export const createSampleVideoData = (count: number = 12): any[] => {
  const now = new Date();
  return Array(count).fill(null).map((_, i) => ({
    id: `sample-${i}`,
    video_id: `sample-vid-${i}`,
    title: `Sample Video ${i+1}`,
    thumbnail: '/placeholder.svg',
    channel_name: "Sample Channel",
    channel_id: "sample-channel",
    views: 1000 * (i+1),
    uploaded_at: new Date(now.getTime() - (i * 86400000)).toISOString(),
    category: "other",
    description: "This is a sample video until real content loads."
  }));
};
