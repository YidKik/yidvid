
import { VideoData } from "../../types/video-fetcher";

/**
 * Format raw video data to VideoData interface
 */
export const formatVideoData = (videosData: any[]): VideoData[] => {
  return videosData.map(video => ({
    id: video.id,
    video_id: video.video_id,
    title: video.title || "Untitled Video",
    thumbnail: video.thumbnail || '/placeholder.svg',
    channelName: video.channel_name || "Unknown Channel",
    channelId: video.channel_id || "unknown-channel",
    views: typeof video.views === 'number' ? video.views : 0,
    uploadedAt: video.uploaded_at || new Date().toISOString(),
    category: video.category || null,
    description: video.description || null,
    channelThumbnail: video.youtube_channels?.thumbnail_url || null
  }));
};
