
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
    const uploaded_at = video.uploaded_at ? new Date(video.uploaded_at) : new Date();
    const created_at = video.created_at ? new Date(video.created_at) : new Date();
    const updated_at = video.updated_at ? new Date(video.updated_at) : new Date();
    
    return {
      id: video.id,
      video_id: video.video_id || "Untitled Video",
      title: video.title || "Untitled Video",
      thumbnail: video.thumbnail || '/placeholder.svg',
      channel_name: video.channel_name || "Unknown Channel",
      channel_id: video.channel_id || "unknown-channel",
      views: viewsCount,
      uploaded_at: uploaded_at,
      created_at: created_at,
      updated_at: updated_at,
      description: video.description || null,
      channelThumbnail: video.youtube_channels?.thumbnail_url || null,
      category: video.category || null
    };
  });
};
