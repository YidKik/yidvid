
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
      
      // If the error is due to recursion in policy, try a select without RLS using service role
      if (dbError.message?.includes('recursion detected in policy')) {
        console.log("Attempting to fetch videos with simplified query due to policy issues");
        
        // Try a simpler query without the 'deleted_at' filter
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("youtube_videos")
          .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at")
          .order("uploaded_at", { ascending: false })
          .limit(50); // Limit to 50 videos to avoid overload
          
        if (fallbackError) {
          console.error("Fallback query also failed:", fallbackError);
          
          // Emergency fallback - return hardcoded placeholder data
          return getSampleVideoData();
        }
        
        return fallbackData || [];
      }
      
      // For other errors, return sample data as fallback
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
      .select("channel_id");

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
      .order("uploaded_at", { ascending: false });

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
