
import { VideoData } from "../types/video-fetcher";

/**
 * Check if the array of videos contains real videos (not samples)
 */
export const hasRealVideos = (videos?: VideoData[] | null): boolean => {
  if (!videos || videos.length === 0) return false;
  
  // Check a few videos to determine if they're real
  const realVideoCount = videos.filter(video => 
    !video.id.toString().includes('sample') && 
    !video.video_id.includes('sample') &&
    video.channelName !== "Sample Channel" &&
    video.title !== "Sample Video 1"
  ).length;
  
  return realVideoCount > 0;
};

/**
 * Create sample videos for fallback display
 */
export const createSampleVideos = (count = 12): VideoData[] => {
  const now = new Date();
  return Array(count).fill(null).map((_, i) => ({
    id: `sample-${i}`,
    video_id: `sample-vid-${i}`,
    title: `Sample Video ${i+1}`,
    thumbnail: '/placeholder.svg',
    channelName: "Sample Channel",
    channelId: "sample-channel",
    views: 1000 * (i+1),
    uploadedAt: new Date(now.getTime() - (i * 86400000)).toISOString(),
    category: "other",
    description: "This is a sample video until real content loads."
  }));
};

/**
 * Format views for display
 */
export const formatVideoViews = (views: number): string => {
  if (views === 0) return "No views";
  if (views < 1000) return `${views} views`;
  if (views < 1000000) return `${(views / 1000).toFixed(1)}K views`;
  return `${(views / 1000000).toFixed(1)}M views`;
};
