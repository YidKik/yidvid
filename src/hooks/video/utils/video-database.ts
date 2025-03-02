
import { supabase } from "@/integrations/supabase/client";
import { VideoData, ChannelData } from "../types/video-fetcher";
import { toast } from "sonner";

/**
 * Fetch all videos from the database with improved error handling
 */
export const fetchVideosFromDatabase = async (): Promise<any[]> => {
  try {
    console.log("Fetching videos from database...");
    
    // Improve the query to get more recent videos first and limit to latest 200
    const { data, error } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, category, description")
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("Error fetching videos from database:", error);
      toast.error("Error loading videos. Trying alternate methods...");
      return getSampleVideoData(10); // Return sample data
    }
    
    if (!data || data.length === 0) {
      console.log("No videos found in database, using sample data");
      toast.warning("No videos found. Showing sample data while trying to fetch new content...");
      return getSampleVideoData(10);
    }
    
    console.log(`Successfully fetched ${data?.length || 0} videos from database, most recent: ${new Date(data[0].uploaded_at).toLocaleString()}`);
    return data;
  } catch (err) {
    console.error("Failed to fetch videos from database:", err);
    toast.error("Error loading videos. Showing sample data.");
    return getSampleVideoData(10);
  }
};

/**
 * Generate sample video data as fallback with more variety
 */
const getSampleVideoData = (count: number = 6): any[] => {
  console.log(`Using ${count} sample video items as fallback`);
  const sampleData = [];
  
  const categories = ["music", "torah", "inspiration", "podcast", "education", "entertainment"];
  
  for (let i = 1; i <= count; i++) {
    sampleData.push({
      id: `sample-${i}`,
      video_id: `sample-${i}`,
      title: `Sample Video ${i} - Data could not be loaded from database`,
      thumbnail: "/placeholder.svg",
      channel_name: `Sample Channel ${Math.ceil(i/2)}`,
      channel_id: `sample-channel-${Math.ceil(i/2)}`,
      views: i * 100,
      uploaded_at: new Date().toISOString(),
      category: categories[i % categories.length],
      description: "This is a sample video description. Actual data could not be loaded."
    });
  }
  
  return sampleData;
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
      return getSampleChannelData(10);
    }
    
    if (!data || data.length === 0) {
      console.log("No channels found, using sample data");
      return getSampleChannelData(10);
    }
    
    console.log(`Successfully fetched ${data?.length || 0} active channels`);
    return data;
  } catch (err) {
    console.error("Failed to fetch channels:", err);
    return getSampleChannelData(10);
  }
};

/**
 * Generate sample channel data
 */
const getSampleChannelData = (count: number = 5): ChannelData[] => {
  console.log(`Using ${count} sample channel items as fallback`);
  const channels = [];
  
  for (let i = 1; i <= count; i++) {
    channels.push({ channel_id: `sample-channel-${i}` });
  }
  
  return channels;
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
      toast.error("Error refreshing videos. Showing cached data.");
      return getSampleVideoData(10);
    }
    
    if (!data || data.length === 0) {
      console.log("No updated videos found, using sample data");
      toast.warning("No videos found. Showing sample data.");
      return getSampleVideoData(10);
    }
    
    console.log(`Successfully fetched ${data?.length || 0} updated videos, most recent: ${new Date(data[0].uploaded_at).toLocaleString()}`);
    return data;
  } catch (error) {
    console.error("Error in fetchUpdatedVideosAfterSync:", error);
    return getSampleVideoData(10);
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
