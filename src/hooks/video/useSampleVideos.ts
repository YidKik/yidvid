
import { hasRealVideos, createSampleVideos } from "./utils/validation";
import { VideoData } from "./types/video-fetcher";

export const useSampleVideos = () => {
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
