
import { VideoData } from "../types/video-fetcher";
import { supabase } from "@/integrations/supabase/client";

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

/**
 * Fetch videos from the database
 */
export const fetchVideosFromDatabase = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from("youtube_videos")
      .select("*, youtube_channels(thumbnail_url)")
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false })
      .limit(150);

    if (error) {
      console.error("Error fetching videos:", error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error("Failed to fetch videos:", err);
    return [];
  }
};

/**
 * Fetch active channels from the database
 */
export const fetchActiveChannels = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from("youtube_channels")
      .select("channel_id, thumbnail_url")
      .is("deleted_at", null)
      .limit(50);

    if (error) {
      console.error("Error fetching channels:", error);
      return [];
    }
    
    return data || [];
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
    const { data, error } = await supabase
      .from("youtube_videos")
      .select("*, youtube_channels(thumbnail_url)")
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false })
      .limit(150);

    if (error) {
      console.error("Error fetching updated videos:", error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error("Error fetching updated videos:", err);
    return [];
  }
};
