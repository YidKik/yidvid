
import { VideoData } from "../../types/video-fetcher";

/**
 * Format raw video data to VideoData interface
 * with improved views handling
 */
export const formatVideoData = (videosData: any[]): VideoData[] => {
  return videosData.map(video => {
    // Ensure views is correctly processed as a number when available
    let viewsCount = 0;
    if (video.views !== null && video.views !== undefined) {
      // Parse as number if it's a string, otherwise use as is
      viewsCount = typeof video.views === 'string' ? parseInt(video.views) : video.views;
      // Ensure it's at least 0 if parsing results in NaN
      viewsCount = isNaN(viewsCount) ? 0 : viewsCount;
    }
    
    // Parse dates properly
    const uploadedAt = video.uploaded_at ? new Date(video.uploaded_at) : new Date();
    const createdAt = video.created_at ? new Date(video.created_at) : new Date();
    const updatedAt = video.updated_at ? new Date(video.updated_at) : new Date();
    
    return {
      id: video.id,
      video_id: video.video_id || "Untitled Video",
      title: video.title || "Untitled Video",
      thumbnail: video.thumbnail || '/placeholder.svg',
      channelName: video.channel_name || "Unknown Channel",
      channelId: video.channel_id || "unknown-channel",
      views: viewsCount,
      uploadedAt: uploadedAt,
      createdAt: createdAt,
      updatedAt: updatedAt,
      description: video.description || null,
      channelThumbnail: video.youtube_channels?.thumbnail_url || null,
      category: video.category || null
    };
  });
};
