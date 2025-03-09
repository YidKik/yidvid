
import { VideoData } from "../types/video-fetcher";

/**
 * Check if videos are real or sample data
 */
export const hasRealVideos = (videos: VideoData[] | undefined): boolean => {
  if (!videos || videos.length === 0) return false;
  
  return videos.some(v => 
    !v.id.toString().includes('sample') && 
    v.channelName !== "Sample Channel" &&
    !v.video_id.includes('sample')
  );
};

/**
 * Create sample videos for fallback if needed
 */
export const createSampleVideos = (): VideoData[] => {
  const now = new Date();
  return Array(12).fill(null).map((_, i) => ({
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
