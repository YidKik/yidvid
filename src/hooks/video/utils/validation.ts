
import { VideoData } from "../types/video-fetcher";

/**
 * Checks if there are real videos in the array (not sample videos)
 */
export const hasRealVideos = (videos: VideoData[]): boolean => {
  if (!videos || videos.length === 0) return false;
  
  // Consider videos real if at least one video doesn't have "sample" in the id
  return videos.some(video => 
    !video.id.toString().includes('sample') && 
    !video.title.includes('Sample Video')
  );
};

/**
 * Creates sample videos for fallback when no real videos are available
 */
export const createSampleVideos = (count = 12): VideoData[] => {
  const now = new Date().toISOString();
  return Array.from({ length: count }).map((_, i) => ({
    id: `sample-${i}`,
    video_id: `sample-video-id-${i}`,
    title: `Sample Video ${i + 1}`,
    description: "This is a sample video description.",
    thumbnail: "/placeholder.svg",
    channelName: "Sample Channel",
    channelId: "sample-channel",
    views: Math.floor(Math.random() * 10000),
    uploadedAt: now,
    createdAt: now,
    updatedAt: now,
    duration: "0:30",
    channelThumbnail: null
  }));
};

/**
 * Filters out unavailable videos with optimized performance
 */
export const filterUnavailableVideos = (videos: VideoData[]): VideoData[] => {
  if (!videos || videos.length === 0) return [];
  
  return videos.filter(video => isVideoAvailable(video));
};

/**
 * Check if a single video is available
 */
export const isVideoAvailable = (video: VideoData): boolean => {
  if (!video) return false;
  
  // Skip videos with invalid thumbnails or titles
  const hasThumbnail = video.thumbnail && 
                       video.thumbnail !== "null" && 
                       video.thumbnail !== "undefined" &&
                       !video.thumbnail.includes("unavailable");
                       
  const hasTitle = video.title && 
                   video.title !== "null" && 
                   video.title !== "undefined";
                   
  const hasVideoId = video.video_id && 
                     video.video_id !== "null" &&
                     video.video_id !== "undefined";
                     
  return hasThumbnail && hasTitle && hasVideoId;
};
