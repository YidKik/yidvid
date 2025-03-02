
import { supabase } from "@/integrations/supabase/client";
import { VideoData, ChannelData } from "../types/video-fetcher";

/**
 * Fetch all videos from the database with improved error handling
 */
export const fetchVideosFromDatabase = async (): Promise<any[]> => {
  try {
    console.log("Fetching videos from database...");
    
    // Modify the query to be simpler and explicitly exclude deleted videos
    const { data, error } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at")
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false })
      .limit(100); // Increased limit to get more videos

    if (error) {
      console.error("Error fetching videos from database:", error);
      return getSampleVideoData(10); // Return sample data
    }
    
    if (!data || data.length === 0) {
      console.log("No videos found in database, using sample data");
      return getSampleVideoData(10);
    }
    
    console.log(`Successfully fetched ${data?.length || 0} videos`);
    return data;
  } catch (err) {
    console.error("Failed to fetch videos from database:", err);
    return getSampleVideoData(10);
  }
};

/**
 * Generate sample video data as fallback with more variety
 */
const getSampleVideoData = (count: number = 6): any[] => {
  console.log(`Using ${count} sample video items as fallback`);
  const sampleData = [];
  
  for (let i = 1; i <= count; i++) {
    sampleData.push({
      id: `sample-${i}`,
      video_id: `sample-${i}`,
      title: `Sample Video ${i} - Data could not be loaded from database`,
      thumbnail: "/placeholder.svg",
      channel_name: `Sample Channel ${Math.ceil(i/2)}`,
      channel_id: `sample-channel-${Math.ceil(i/2)}`,
      views: i * 100,
      uploaded_at: new Date().toISOString()
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
    
    // Modify the query to explicitly exclude deleted channels
    const { data, error } = await supabase
      .from("youtube_channels")
      .select("channel_id")
      .is("deleted_at", null)
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
    
    const { data, error } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at")
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching updated videos:', error);
      return getSampleVideoData(10);
    }
    
    if (!data || data.length === 0) {
      console.log("No updated videos found, using sample data");
      return getSampleVideoData(10);
    }
    
    console.log(`Successfully fetched ${data?.length || 0} updated videos`);
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
    title: video.title,
    thumbnail: video.thumbnail || '/placeholder.svg',
    channelName: video.channel_name,
    channelId: video.channel_id,
    views: video.views || 0,
    uploadedAt: video.uploaded_at
  }));
};
