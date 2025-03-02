
import { supabase } from "@/integrations/supabase/client";
import { VideoData, ChannelData } from "../types/video-fetcher";
import { toast } from "sonner";

/**
 * Fetch all videos from the database with improved error handling
 */
export const fetchVideosFromDatabase = async (): Promise<any[]> => {
  try {
    console.log("Fetching videos from database...");
    
    // Try direct query first to bypass any potential RLS issues
    const { data: directData, error: directError } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, category, description")
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false })
      .limit(200);
      
    if (!directError && directData && directData.length > 0) {
      console.log(`Successfully fetched ${directData.length} videos directly`);
      return directData;
    }
    
    if (directError) {
      console.warn("Direct query error, trying alternative approach:", directError);
    }
    
    // Try with a more simplified query if the first one failed
    const { data, error } = await supabase
      .from("youtube_videos")
      .select("*")
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("Error fetching videos from database:", error);
      
      // Create sample videos as fallback
      console.warn("Creating sample videos as fallback");
      const now = new Date();
      return Array(8).fill(null).map((_, i) => ({
        id: `sample-${i}`,
        video_id: `sample-vid-${i}`,
        title: `Sample Video ${i+1}`,
        thumbnail: '/placeholder.svg',
        channel_name: "Sample Channel",
        channel_id: "sample-channel",
        views: 1000 * (i+1),
        uploaded_at: new Date(now.getTime() - (i * 86400000)).toISOString(),
        category: "other",
        description: "This is a sample video until real content loads."
      }));
    }
    
    if (!data || data.length === 0) {
      console.log("No videos found in database");
      return [];
    }
    
    console.log(`Successfully fetched ${data?.length || 0} videos from database, most recent: ${new Date(data[0].uploaded_at).toLocaleString()}`);
    return data;
  } catch (err) {
    console.error("Failed to fetch videos from database:", err);
    
    // Create emergency sample videos
    console.warn("Creating emergency sample videos");
    const now = new Date();
    return Array(8).fill(null).map((_, i) => ({
      id: `sample-${i}`,
      video_id: `sample-vid-${i}`,
      title: `Sample Video ${i+1}`,
      thumbnail: '/placeholder.svg',
      channel_name: "Sample Channel",
      channel_id: "sample-channel",
      views: 1000 * (i+1),
      uploaded_at: new Date(now.getTime() - (i * 86400000)).toISOString(),
      category: "other",
      description: "This is a sample video until real content loads."
    }));
  }
};

/**
 * Fetch active channels from the database with better error handling
 */
export const fetchActiveChannels = async (): Promise<ChannelData[]> => {
  try {
    console.log("Fetching active channels...");
    
    // Get more channels to increase chances of finding new content
    const { data, error } = await supabase
      .from("youtube_channels")
      .select("channel_id")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching channels:", error);
      // Create sample channel as fallback
      return [{ channel_id: "sample-channel" }];
    }
    
    if (!data || data.length === 0) {
      console.log("No channels found");
      return [{ channel_id: "sample-channel" }];
    }
    
    console.log(`Successfully fetched ${data?.length || 0} active channels`);
    return data;
  } catch (err) {
    console.error("Failed to fetch channels:", err);
    return [{ channel_id: "sample-channel" }];
  }
};

/**
 * Fetch updated videos after syncing with YouTube
 */
export const fetchUpdatedVideosAfterSync = async (): Promise<any[]> => {
  try {
    console.log("Fetching updated videos after sync...");
    
    // Get most recent videos first, limited to 200
    const { data, error } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, category, description")
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error('Error fetching updated videos:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log("No updated videos found");
      return [];
    }
    
    console.log(`Successfully fetched ${data?.length || 0} updated videos, most recent: ${new Date(data[0].uploaded_at).toLocaleString()}`);
    return data;
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
    title: video.title || "Untitled Video",
    thumbnail: video.thumbnail || '/placeholder.svg',
    channelName: video.channel_name || "Unknown Channel",
    channelId: video.channel_id || "unknown-channel",
    views: video.views || 0,
    uploadedAt: video.uploaded_at || new Date().toISOString(),
    category: video.category || null,
    description: video.description || null
  }));
};
