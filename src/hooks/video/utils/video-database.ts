
import { supabase } from "@/integrations/supabase/client";
import { VideoData, ChannelData } from "../types/video-fetcher";

/**
 * Fetch all videos from the database
 */
export const fetchVideosFromDatabase = async (): Promise<any[]> => {
  try {
    console.log("Fetching videos from database...");
    
    // Try a simple query to avoid policy recursion issues
    const { data: initialData, error: dbError } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at")
      .order("uploaded_at", { ascending: false })
      .limit(50); // Limit to 50 to avoid policy issues

    if (dbError) {
      console.error("Error fetching videos from database:", dbError);
      
      // For any error, fall back to sample data immediately
      return getSampleVideoData();
    }
    
    console.log(`Successfully fetched ${initialData?.length || 0} videos`);
    return initialData || [];
  } catch (err) {
    console.error("Failed to fetch videos from database:", err);
    return getSampleVideoData();
  }
};

/**
 * Generate sample video data as fallback
 */
const getSampleVideoData = (): any[] => {
  console.log("Using sample video data as fallback");
  return [
    {
      id: "sample-1",
      video_id: "sample-1",
      title: "Sample Video 1 - Data could not be loaded from database",
      thumbnail: "/placeholder.svg",
      channel_name: "Sample Channel",
      channel_id: "sample-channel-1",
      views: 100,
      uploaded_at: new Date().toISOString()
    },
    {
      id: "sample-2",
      video_id: "sample-2",
      title: "Sample Video 2 - Please check database connection",
      thumbnail: "/placeholder.svg",
      channel_name: "Sample Channel",
      channel_id: "sample-channel-1",
      views: 200,
      uploaded_at: new Date().toISOString()
    },
    {
      id: "sample-3",
      video_id: "sample-3",
      title: "Sample Video 3 - RLS policy issue detected",
      thumbnail: "/placeholder.svg",
      channel_name: "Sample Channel",
      channel_id: "sample-channel-2",
      views: 300,
      uploaded_at: new Date().toISOString()
    },
    {
      id: "sample-4",
      video_id: "sample-4",
      title: "Sample Video 4 - Check Supabase RLS policies",
      thumbnail: "/placeholder.svg",
      channel_name: "Sample Channel",
      channel_id: "sample-channel-2",
      views: 400,
      uploaded_at: new Date().toISOString()
    }
  ];
};

/**
 * Fetch active channels from the database
 */
export const fetchActiveChannels = async (): Promise<ChannelData[]> => {
  try {
    console.log("Fetching active channels...");
    
    const { data: channels, error: channelError } = await supabase
      .from("youtube_channels")
      .select("channel_id")
      .limit(20); // Limit to 20 to avoid policy issues

    if (channelError) {
      console.error("Error fetching channels:", channelError);
      
      // Return sample data if there's an error
      return [
        { channel_id: "sample-channel-1" },
        { channel_id: "sample-channel-2" }
      ];
    }
    
    console.log(`Successfully fetched ${channels?.length || 0} active channels`);
    return channels || [];
  } catch (err) {
    console.error("Failed to fetch channels:", err);
    return [
      { channel_id: "sample-channel-1" },
      { channel_id: "sample-channel-2" }
    ];
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
      .order("uploaded_at", { ascending: false })
      .limit(50); // Limit to 50 to avoid policy issues

    if (updateError) {
      console.error('Error fetching updated videos:', updateError);
      return getSampleVideoData();
    }
    
    console.log(`Successfully fetched ${updatedData?.length || 0} updated videos`);
    return updatedData || [];
  } catch (error) {
    console.error("Error in fetchUpdatedVideosAfterSync:", error);
    return getSampleVideoData();
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
