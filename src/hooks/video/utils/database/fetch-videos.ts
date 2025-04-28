
import { supabase } from "@/integrations/supabase/client";
import { VideoData } from "../../types/video-fetcher";

/**
 * Fetch all videos from the database with improved performance
 */
export const fetchVideosFromDatabase = async (): Promise<any[]> => {
  try {
    console.log("Fetching videos from database with optimized performance...");
    
    // Modified query to sort by updated_at instead of uploaded_at
    const { data: simpleData, error: simpleError } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, category, description")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false }) // Changed to updated_at
      .limit(150);
      
    if (!simpleError && simpleData && simpleData.length > 0) {
      console.log(`Successfully fetched ${simpleData.length} videos with simplified query`);
      
      return simpleData.map(video => ({
        ...video,
        views: video.views !== null ? parseInt(String(video.views)) : 0
      }));
    }
    
    if (simpleError) {
      console.warn("Simple query failed:", simpleError);
      
      try {
        // Try edge function as fallback
        const response = await fetch("https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/get-public-videos", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.data && Array.isArray(result.data) && result.data.length > 0) {
            console.log(`Retrieved ${result.data.length} videos with edge function`);
            return result.data;
          }
        }
      } catch (edgeError) {
        console.warn("Edge function error:", edgeError);
      }
      
      // Try minimal query as last resort
      const { data: minimalData, error: minimalError } = await supabase
        .from("youtube_videos")
        .select("*")
        .order("updated_at", { ascending: false }) // Changed to updated_at
        .limit(50);
        
      if (!minimalError && minimalData && minimalData.length > 0) {
        console.log(`Retrieved ${minimalData.length} videos with minimal query`);
        
        return minimalData.map(video => ({
          ...video,
          views: video.views !== null ? parseInt(String(video.views)) : 0
        }));
      }
      
      console.error("All query methods failed:", minimalError);
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
    
    const { data, error } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, category, description")
      .order("updated_at", { ascending: false })  // Changed to updated_at
      .limit(150);

    if (error) {
      console.error('Error fetching updated videos:', error);
      
      // Try simpler approach if that fails
      const { data: basicData, error: basicError } = await supabase
        .from("youtube_videos")
        .select("*")
        .order("updated_at", { ascending: false })  // Changed to updated_at
        .limit(100);
        
      if (!basicError && basicData && basicData.length > 0) {
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
    
    return data.map(video => ({
      ...video,
      views: video.views !== null ? parseInt(String(video.views)) : 0
    }));
  } catch (error) {
    console.error("Error in fetchUpdatedVideosAfterSync:", error);
    return [];
  }
};
