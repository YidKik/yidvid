
import { supabase } from "@/integrations/supabase/client";

/**
 * Performs a direct database query with multiple fallback strategies
 * to ensure we can get videos even if RLS is causing issues
 */
export const performDirectDatabaseQuery = async (): Promise<any[]> => {
  try {
    // Try direct query first
    const { data: directData, error: directError } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, category, description")
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false })
      .limit(100);
    
    if (!directError && directData && directData.length > 0) {
      console.log(`Direct query successful: ${directData.length} videos`);
      return directData;
    }

    console.error("Direct query failed:", directError);
    
    // Try fallback query with less filters
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at")
      .order("uploaded_at", { ascending: false })
      .limit(100);
      
    if (!fallbackError && fallbackData && fallbackData.length > 0) {
      console.log(`Fallback query successful: ${fallbackData.length} videos`);
      return fallbackData;
    }
    
    console.error("Fallback query also failed:", fallbackError);
    
    // Try last resort query with minimal fields
    const { data: lastResortData, error: lastResortError } = await supabase
      .from("youtube_videos")
      .select("*")
      .limit(50);
      
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
          "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg`
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
