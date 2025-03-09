
import { supabase } from "@/integrations/supabase/client";
import { VideoData } from "../../types/video-fetcher";

/**
 * Fetch all videos from the database with improved performance
 */
export const fetchVideosFromDatabase = async (): Promise<any[]> => {
  try {
    console.log("Fetching videos from database with optimized performance...");
    
    // Try a direct query with optimized fields for faster loading
    const { data: directData, error: directError } = await supabase
      .from("youtube_videos")
      .select(`
        id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, category, description,
        youtube_channels(thumbnail_url)
      `)
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false })
      .limit(150);  // Increased to get more videos
      
    if (!directError && directData && directData.length > 0) {
      console.log(`Successfully fetched ${directData.length} videos directly`);
      return directData;
    }
    
    if (directError) {
      console.warn("Direct query failed, trying simplified approach:", directError);
    }
    
    // Use a simpler query with fewer joins as backup
    const { data: simpleData, error: simpleError } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, category, description")
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false })
      .limit(100);
      
    if (!simpleError && simpleData && simpleData.length > 0) {
      console.log(`Successfully fetched ${simpleData.length} videos with simplified query`);
      return simpleData;
    }
    
    // Try basic query without filters as last resort
    const { data: basicData, error: basicError } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, category, description")
      .limit(50);
      
    if (!basicError && basicData && basicData.length > 0) {
      console.log(`Got ${basicData.length} videos with basic query`);
      return basicData;
    }
    
    console.log("No videos found in database with any query method");
    return [];
  } catch (err) {
    console.error("Failed to fetch videos from database:", err);
    return [];
  }
};

/**
 * Fetch updated videos after syncing with YouTube
 * with improved performance
 */
export const fetchUpdatedVideosAfterSync = async (): Promise<any[]> => {
  try {
    console.log("Fetching updated videos after sync...");
    
    // Optimized query with only essential fields
    const { data, error } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, category, description")
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false })
      .limit(150);  // Increased limit to get more content

    if (error) {
      console.error('Error fetching updated videos:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log("No updated videos found");
      return [];
    }
    
    console.log(`Successfully fetched ${data?.length || 0} updated videos`);
    return data;
  } catch (error) {
    console.error("Error in fetchUpdatedVideosAfterSync:", error);
    return [];
  }
};
