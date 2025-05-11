
import { VideoData } from "../types/video-fetcher";

/**
 * Formats raw database video data into the VideoData format
 */
export const formatVideoData = (data: any[]): VideoData[] => {
  if (!data || !Array.isArray(data)) {
    console.warn("No video data to format or data is not an array");
    return [];
  }
  
  return data.map(video => ({
    id: video.id,
    video_id: video.video_id || "",
    title: video.title || "Untitled Video",
    description: video.description || "",
    thumbnail: video.thumbnail || "/placeholder.svg",
    channelName: video.channel_name || "Unknown Channel",
    channelId: video.channel_id || "",
    views: video.views !== null ? Number(video.views) : 0,
    uploadedAt: video.uploaded_at || new Date().toISOString(),
    createdAt: video.created_at || new Date().toISOString(),
    updatedAt: video.updated_at || new Date().toISOString(),
    duration: video.duration || null,
    channelThumbnail: video.youtube_channels?.thumbnail_url || null
  }));
};
