import { VideoData } from "../types/video-fetcher";

/**
 * Check if the array of videos contains real videos (not samples)
 * with improved performance, skipping check if user is logged in
 */
export const hasRealVideos = (videos?: VideoData[] | null, isAuthenticated?: boolean): boolean => {
  // If user is authenticated, assume videos are real
  if (isAuthenticated) return true;
  
  if (!videos || videos.length === 0) return false;
  
  // Check just the first few videos to determine if they're real (more efficient)
  const sampleCount = Math.min(5, videos.length);
  for (let i = 0; i < sampleCount; i++) {
    const video = videos[i];
    if (!video.id.toString().includes('sample') && 
        !video.video_id.includes('sample') &&
        video.channelName !== "Sample Channel") {
      return true; // Found at least one real video
    }
  }
  
  return false;
};

/**
 * Create sample videos for fallback display with better performance
 */
export const createSampleVideos = (count = 12): VideoData[] => {
  const now = new Date();
  // Pre-calculate the base time once
  const baseTime = now.getTime();
  
  return Array(count).fill(null).map((_, i) => ({
    id: `sample-${i}`,
    video_id: `sample-vid-${i}`,
    title: `Sample Video ${i+1}`,
    thumbnail: '/placeholder.svg',
    channelName: "Sample Channel",
    channelId: "sample-channel",
    views: 1000 * (i+1),
    uploadedAt: new Date(baseTime - (i * 86400000)),
    createdAt: new Date(baseTime - (i * 86400000)),
    updatedAt: new Date(baseTime - (i * 86400000)),
    description: "This is a sample video until real content loads.",
    channelThumbnail: '/placeholder.svg'
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

/**
 * Checks if a video has a valid, available thumbnail
 * @param video The video to check
 * @returns boolean indicating if the video appears to be available
 */
export const isVideoAvailable = (video: any): boolean => {
  if (!video) return false;
  
  // Check for placeholder thumbnails which indicate unavailable videos
  // These typically contain 'hqdefault' with default YouTube placeholder
  const hasBrokenThumbnail = video.thumbnail?.includes('hqdefault') && 
    (video.thumbnail?.includes('default.jpg') || video.thumbnail?.includes('sddefault.jpg'));
    
  // Check for obvious placeholder URLs
  const isPlaceholder = video.thumbnail?.includes('no_thumbnail') || 
    video.thumbnail?.includes('placeholder') || 
    !video.thumbnail || 
    video.thumbnail === '';

  // Check for deleted videos with placeholder text in title
  const hasUnavailableTitle = video.title?.includes('[Deleted video]') || 
    video.title?.includes('[Private video]') ||
    video.title?.includes('[Unavailable video]');
    
  return !(hasBrokenThumbnail || isPlaceholder || hasUnavailableTitle);
};

/**
 * Further improves the video filtering with availability check
 * @param videos Array of videos to filter
 * @returns Filtered array of available videos
 */
export const filterUnavailableVideos = (videos: any[]): any[] => {
  if (!videos || !Array.isArray(videos)) return [];
  
  return videos.filter(video => isVideoAvailable(video));
};
