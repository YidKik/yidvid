
import { VideoData } from "./types/video-fetcher";
import { useMemo } from "react";

export const useSampleVideos = () => {
  /**
   * Creates sample videos for fallback when no real videos are available
   */
  const createSampleVideos = useMemo(() => (count = 8): VideoData[] => {
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
  }, []);

  /**
   * Checks if videos array only contains sample videos
   */
  const hasOnlySampleVideos = (videos: VideoData[]): boolean => {
    if (!videos || videos.length === 0) return false;
    return videos.every(video => 
      video.id.toString().includes('sample') || 
      video.video_id.includes('sample')
    );
  };

  return {
    createSampleVideos,
    hasOnlySampleVideos
  };
};
