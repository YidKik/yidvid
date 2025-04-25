
import { useCallback } from "react";
import { VideoData } from "./types/video-fetcher";

export const useSampleVideos = () => {
  const createSampleVideos = useCallback((count: number = 8): VideoData[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `sample-${i}`,
      video_id: `sample-video-id-${i}`,
      title: `Sample Video ${i + 1}`,
      thumbnail: "https://via.placeholder.com/480x360?text=Sample+Video",
      channelName: "Sample Channel",
      channelId: "sample-channel",
      views: Math.floor(Math.random() * 1000),
      uploadedAt: new Date(Date.now() - i * 86400000).toISOString(),
      description: "This is a sample video while content loads.",
      channelThumbnail: "https://via.placeholder.com/50x50?text=SC"
    }));
  }, []);

  const hasOnlySampleVideos = useCallback((videos: VideoData[]): boolean => {
    return videos.every(v => 
      v.id.toString().includes('sample') || 
      v.video_id.includes('sample') ||
      v.channelName === "Sample Channel"
    );
  }, []);

  return { createSampleVideos, hasOnlySampleVideos };
};
