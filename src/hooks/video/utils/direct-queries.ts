
import { supabase } from "@/integrations/supabase/client";

/**
 * Direct database query for fetching videos
 * with the most optimized performance possible
 */
export const performDirectDatabaseQuery = async (): Promise<any[]> => {
  try {
    // Direct query with minimal fields and explicit ordering
    const { data, error } = await supabase.rpc('get_latest_videos', { limit_count: 150 })
      .select('id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at');
    
    if (error) {
      console.error("Direct query failed:", error);
      
      // Fallback to direct table query
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('youtube_videos')
        .select('id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, category, description')
        .is('deleted_at', null)
        .order('uploaded_at', { ascending: false })
        .limit(150);
      
      if (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
        return [];
      }
      
      return fallbackData || [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in direct database query:", error);
    return [];
  }
};
