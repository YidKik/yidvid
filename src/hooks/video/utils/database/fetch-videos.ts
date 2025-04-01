
import { supabase } from "@/integrations/supabase/client";
import { VideoData } from "../../types/video-fetcher";

/**
 * Fetch all videos from the database with improved performance
 */
export const fetchVideosFromDatabase = async (): Promise<any[]> => {
  try {
    console.log("Fetching videos from database with optimized performance...");
    
    // Try a simplified query first without complex joins for anonymous access
    // Explicitly include views in the query
    const { data: simpleData, error: simpleError } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, category, description")
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false })  // Make sure we sort by newest first
      .limit(150);
      
    if (!simpleError && simpleData && simpleData.length > 0) {
      console.log(`Successfully fetched ${simpleData.length} videos with simplified query`);
      
      // Ensure views are correctly processed
      return simpleData.map(video => ({
        ...video,
        views: video.views !== null ? parseInt(String(video.views)) : 0
      }));
    }
    
    if (simpleError) {
      console.warn("Simple query failed:", simpleError);
      
      // Try even simpler query without filters as second attempt
      const { data: basicData, error: basicError } = await supabase
        .from("youtube_videos")
        .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at")
        .order("uploaded_at", { ascending: false })  // Ensure we're sorting by newest
        .limit(100);
        
      if (!basicError && basicData && basicData.length > 0) {
        console.log(`Got ${basicData.length} videos with basic query`);
        
        // Process views for this data too
        return basicData.map(video => ({
          ...video,
          views: video.views !== null ? parseInt(String(video.views)) : 0
        }));
      }
      
      if (basicError) {
        console.error("Basic query also failed:", basicError);
        
        // Try absolute minimal query as last resort
        const { data: minimalData, error: minimalError } = await supabase
          .from("youtube_videos")
          .select("*")
          .order("uploaded_at", { ascending: false })  // Still sorting by newest
          .limit(50);
          
        if (!minimalError && minimalData && minimalData.length > 0) {
          console.log(`Retrieved ${minimalData.length} videos with minimal query`);
          
          // Process views for this data as well
          return minimalData.map(video => ({
            ...video,
            views: video.views !== null ? parseInt(String(video.views)) : 0
          }));
        }
        
        console.error("All query methods failed:", minimalError);
      }
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
    
    // Simplified query without RLS-triggering filters
    // Explicitly include views in the query
    const { data, error } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, category, description")
      .order("uploaded_at", { ascending: false })  // Explicitly sort by newest first
      .limit(150);

    if (error) {
      console.error('Error fetching updated videos:', error);
      
      // Try an even simpler approach if that fails
      const { data: basicData, error: basicError } = await supabase
        .from("youtube_videos")
        .select("*")
        .order("uploaded_at", { ascending: false })  // Still sort by newest
        .limit(100);
        
      if (!basicError && basicData && basicData.length > 0) {
        // Process views for this data
        return basicData.map(video => ({
          ...video,
          views: video.views !== null ? parseInt(String(video.views)) : 0
        }));
      }
      
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log("No updated videos found");
      return [];
    }
    
    console.log(`Successfully fetched ${data?.length || 0} updated videos`);
    
    // Process views for this data
    return data.map(video => ({
      ...video,
      views: video.views !== null ? parseInt(String(video.views)) : 0
    }));
  } catch (error) {
    console.error("Error in fetchUpdatedVideosAfterSync:", error);
    return [];
  }
};
