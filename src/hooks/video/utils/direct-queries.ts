
import { supabase } from "@/integrations/supabase/client";

/**
 * Direct database query for fetching videos
 * with the most optimized performance possible
 */
export const performDirectDatabaseQuery = async (): Promise<any[]> => {
  try {
    // Use a direct query instead of RPC
    const { data, error } = await supabase
      .from('youtube_videos')
      .select('id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at')
      .is('deleted_at', null)
      .order('uploaded_at', { ascending: false })
      .limit(150);
    
    if (error) {
      console.error("Direct query failed:", error);
      
      // Fallback to an alternative query with more fields
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('youtube_videos')
        .select('id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, category, description')
        .is('deleted_at', null)
        .order('uploaded_at', { ascending: false })
        .limit(150);
      
      if (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
        
        // Try an even simpler query as last resort
        const { data: lastResortData, error: lastResortError } = await supabase
          .from('youtube_videos')
          .select('*')
          .order('uploaded_at', { ascending: false })
          .limit(100);
          
        if (lastResortError) {
          console.error("Last resort query failed:", lastResortError);
          return [];
        }
        
        return lastResortData || [];
      }
      
      return fallbackData || [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in direct database query:", error);
    return [];
  }
};
