
import { VideoData } from "./types/video-fetcher";

export const useSampleVideos = () => {
  // Create sample videos for fallback if needed
  const createSampleVideos = (): VideoData[] => {
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

  // Helper to check if videos are real or sample data
  const hasRealVideos = (videos: VideoData[] | undefined): boolean => {
    if (!videos || videos.length === 0) return false;
    
    return videos.some(video => 
      !video.id.toString().startsWith('sample') && 
      video.channelName !== "Sample Channel"
    );
  };

  // Helper to check if we have only sample videos
  const hasOnlySampleVideos = (videos: VideoData[] | undefined): boolean => {
    if (!videos || videos.length === 0) return false;
    return videos.length > 0 && videos[0].id.toString().startsWith('sample');
  };

  return {
    createSampleVideos,
    hasRealVideos,
    hasOnlySampleVideos
  };
};
