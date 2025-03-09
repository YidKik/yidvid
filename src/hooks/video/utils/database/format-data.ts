
import { VideoData } from "../../types/video-fetcher";

/**
 * Format raw video data to VideoData interface
 */
export const formatVideoData = (videosData: any[]): VideoData[] => {
  return videosData.map(video => ({
    id: video.id,
    video_id: video.video_id,
    title: video.title || "Untitled Video",
    thumbnail: video.thumbnail || '/lovable-uploads/2df6b540-f798-4831-8fcc-255a55486aa0.png',
    channelName: video.channel_name || "Unknown Channel",
    channelId: video.channel_id || "unknown-channel",
    views: video.views || 0,
    uploadedAt: video.uploaded_at || new Date().toISOString(),
    category: video.category || null,
    description: video.description || null
  }));
};
