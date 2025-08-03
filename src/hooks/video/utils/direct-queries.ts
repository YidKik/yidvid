
import { supabase } from "@/integrations/supabase/client";

/**
 * Performs a direct database query with multiple fallback strategies
 * to ensure we can get videos even if RLS is causing issues
 */
export const performDirectDatabaseQuery = async (): Promise<any[]> => {
  try {
    // Try direct query first with full data and increased limit
    const { data: directData, error: directError } = await supabase
      .from("youtube_videos")
      .select("*, youtube_channels(thumbnail_url)")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(150);
    
    if (!directError && directData && directData.length > 0) {
      console.log(`Direct query successful: ${directData.length} videos`);
      return directData;
    }

    console.error("Direct query failed:", directError);
    
    // Try fallback query with less filters
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, created_at, updated_at, description")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(150);
      
    if (!fallbackError && fallbackData && fallbackData.length > 0) {
      console.log(`Fallback query successful: ${fallbackData.length} videos`);
      return fallbackData;
    }
    
    console.error("Fallback query also failed:", fallbackError);
    
    // Try last resort query with minimal fields
    const { data: lastResortData, error: lastResortError } = await supabase
      .from("youtube_videos")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(100);
      
    if (!lastResortError && lastResortData && lastResortData.length > 0) {
      console.log(`Last resort query successful: ${lastResortData.length} videos`);
      return lastResortData;
    }
    
    console.error("Last resort query failed:", lastResortError);
    
    // If all else fails, try edge function (bypasses RLS completely)
    try {
      const response = await fetch("https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/get-public-videos", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Use Supabase client instead of direct fetch
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.data && result.data.length > 0) {
          console.log(`Edge function successful: ${result.data.length} videos`);
          return result.data;
        }
      }
      
      console.error("Edge function failed:", response.statusText);
    } catch (edgeError) {
      console.error("Error calling edge function:", edgeError);
    }
    
    // If all queries failed, return empty array
    return [];
  } catch (error) {
    console.error("Error in performDirectDatabaseQuery:", error);
    return [];
  }
};
