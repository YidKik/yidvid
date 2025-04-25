
import { VideoData } from "../types/video-fetcher";

/**
 * Checks if we have actual videos from the database
 * @param videos Array of videos to check
 * @param isAuthenticated Whether the user is authenticated
 * @returns True if we have real videos, false if empty or only sample videos
 */
export const hasRealVideos = (videos: VideoData[] | undefined, isAuthenticated: boolean): boolean => {
  if (!videos || videos.length === 0) return false;
  
  // Check if the videos are sample placeholders
  const hasSampleVideos = videos.some(video => 
    video.id?.toString().includes('sample') || 
    video.video_id?.includes('sample') ||
    video.channelName === "Sample Channel" || 
    video.title?.includes('Sample Video')
  );
  
  if (hasSampleVideos && videos.every(video => 
    video.id?.toString().includes('sample') ||
    video.video_id?.includes('sample') ||
    video.channelName === "Sample Channel"
  )) {
    return false;
  }
  
  return true;
};

/**
 * Creates a set of sample videos as a fallback
 * @param count Number of sample videos to create
 * @returns Array of sample video data
 */
export const createSampleVideos = (count = 12): VideoData[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `sample-${i}`,
    video_id: `sample-video-id-${i}`,
    title: `Sample Video ${i + 1}`,
    thumbnail: "https://via.placeholder.com/480x360?text=Sample+Video",
    channelName: "Sample Channel",
    channelId: "sample-channel",
    views: Math.floor(Math.random() * 1000),
    uploadedAt: new Date(Date.now() - i * 86400000).toISOString(),
    description: "This is a sample video available while content loads.",
    channelThumbnail: "https://via.placeholder.com/50x50?text=SC"
  }));
};
