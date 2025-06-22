
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
    channel_name: video.channel_name || "Unknown Channel",
    channel_id: video.channel_id || "",
    views: video.views !== null ? Number(video.views) : 0,
    uploaded_at: video.uploaded_at || new Date().toISOString(),
    created_at: video.created_at || new Date().toISOString(),
    updated_at: video.updated_at || new Date().toISOString(),
    duration: video.duration || null,
    channelThumbnail: video.youtube_channels?.thumbnail_url || null,
    category: video.category || null
  }));
};

/**
 * Fetches videos from database - only non-deleted videos
 */
export const fetchVideosFromDatabase = async () => {
  // This function is imported and used elsewhere
  // We're keeping it as a separate function for modularity
  const { supabase } = await import("@/integrations/supabase/client");
  
  try {
    const { data, error } = await supabase
      .from("youtube_videos")
      .select("*, youtube_channels(thumbnail_url)")
      .is("deleted_at", null) // Only get non-deleted videos
      .order("created_at", { ascending: false })
      .limit(150);
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching videos from database:", error);
    throw error;
  }
};

/**
 * Fetches active channels from database - only non-deleted channels
 */
export const fetchActiveChannels = async () => {
  const { supabase } = await import("@/integrations/supabase/client");
  
  try {
    const { data, error } = await supabase
      .from("youtube_channels")
      .select("channel_id")
      .is("deleted_at", null); // Only get non-deleted channels
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching channels from database:", error);
    throw error;
  }
};

/**
 * Fetches updated videos after a sync operation
 */
export const fetchUpdatedVideosAfterSync = async () => {
  return fetchVideosFromDatabase();
};
