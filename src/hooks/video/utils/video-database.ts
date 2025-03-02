
import { supabase } from "@/integrations/supabase/client";
import { VideoData, ChannelData } from "../types/video-fetcher";

/**
 * Fetch all videos from the database
 */
export const fetchVideosFromDatabase = async (): Promise<any[]> => {
  try {
    console.log("Fetching videos from database...");
    
    // Adding null checking for the response to avoid crashes
    const { data: initialData, error: dbError } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at")
      .is('deleted_at', null)
      .order("uploaded_at", { ascending: false });

    if (dbError) {
      console.error("Error fetching videos from database:", dbError);
      
      // Try a simpler query without the 'deleted_at' filter
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("youtube_videos")
        .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at")
        .order("uploaded_at", { ascending: false });
        
      if (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
        return [];
      }
      
      return fallbackData || [];
    }
    
    console.log(`Successfully fetched ${initialData?.length || 0} videos`);
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
    console.log("Fetching active channels...");
    
    const { data: channels, error: channelError } = await supabase
      .from("youtube_channels")
      .select("channel_id");

    if (channelError) {
      console.error("Error fetching channels:", channelError);
      return [];
    }
    
    console.log(`Successfully fetched ${channels?.length || 0} active channels`);
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
    console.log("Fetching updated videos after sync...");
    
    const { data: updatedData, error: updateError } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at")
      .order("uploaded_at", { ascending: false });

    if (updateError) {
      console.error('Error fetching updated videos:', updateError);
      return [];
    }
    
    console.log(`Successfully fetched ${updatedData?.length || 0} updated videos`);
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
    thumbnail: video.thumbnail || '/placeholder.svg',
    channelName: video.channel_name,
    channelId: video.channel_id,
    views: video.views || 0,
    uploadedAt: video.uploaded_at
  }));
};
