
import { supabase } from "@/integrations/supabase/client";
import { VideoData, ChannelData } from "../types/video-fetcher";

/**
 * Fetch all videos from the database
 */
export const fetchVideosFromDatabase = async (): Promise<any[]> => {
  try {
    // Adding null checking for the response to avoid crashes
    const { data: initialData, error: dbError } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at")
      .is('deleted_at', null)
      .order("uploaded_at", { ascending: false });

    if (dbError) {
      console.error("Error fetching videos from database:", dbError);
      return [];
    }
    
    return initialData || [];
  } catch (err) {
    console.error("Failed to fetch videos from database:", err);
    return [];
  }
};

/**
 * Fetch active channels from the database
 */
export const fetchActiveChannels = async (): Promise<ChannelData[]> => {
  try {
    const { data: channels, error: channelError } = await supabase
      .from("youtube_channels")
      .select("channel_id")
      .is("deleted_at", null);

    if (channelError) {
      console.error("Error fetching channels:", channelError);
      return [];
    }
    
    return channels || [];
  } catch (err) {
    console.error("Failed to fetch channels:", err);
    return [];
  }
};

/**
 * Fetch updated videos after syncing with YouTube
 */
export const fetchUpdatedVideosAfterSync = async (): Promise<any[]> => {
  try {
    const { data: updatedData, error: updateError } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at")
      .is('deleted_at', null)
      .order("uploaded_at", { ascending: false });

    if (updateError) {
      console.error('Error fetching updated videos:', updateError);
      return [];
    }
    
    return updatedData || [];
  } catch (error) {
    console.error("Error in fetchUpdatedVideosAfterSync:", error);
    return [];
  }
};

/**
 * Format raw video data to VideoData interface
 */
export const formatVideoData = (videosData: any[]): VideoData[] => {
  return videosData.map(video => ({
    id: video.id,
    video_id: video.video_id,
    title: video.title,
    thumbnail: video.thumbnail,
    channelName: video.channel_name,
    channelId: video.channel_id,
    views: video.views || 0,
    uploadedAt: video.uploaded_at
  }));
};
