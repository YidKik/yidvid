
import { supabase } from "@/integrations/supabase/client";

/**
 * Performs direct database queries for videos with fallback strategies
 */
export const performDirectDatabaseQuery = async (): Promise<any[]> => {
  try {
    // Try direct query first with simplified approach for anonymous access
    const { data, error } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, category, description")
      .is('deleted_at', null)
      .order("uploaded_at", { ascending: false })
      .limit(100);  // Reduced limit for faster loading
      
    if (error) {
      console.error("Direct database query error:", error);
      
      // Try an even simpler query if first one fails
      const fallbackData = await supabase
        .from("youtube_videos")
        .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at")
        .order("uploaded_at", { ascending: false })
        .limit(50);
        
      if (!fallbackData.error && fallbackData.data && fallbackData.data.length > 0) {
        console.log(`Retrieved ${fallbackData.data.length} videos with fallback query`);
        return fallbackData.data;
      } else {
        console.warn("Fallback query also failed, trying secondary method");
        return [];
      }
    } else if (data && data.length > 0) {
      console.log(`Successfully fetched ${data.length} videos directly from database`);
      return data;
    } else {
      console.warn("No videos found in direct database query, trying secondary method");
      return [];
    }
  } catch (directError) {
    console.error("Error in direct video fetch:", directError);
    return [];
  }
};
