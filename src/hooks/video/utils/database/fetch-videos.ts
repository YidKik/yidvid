
import { supabase } from "@/integrations/supabase/client";
import { VideoData } from "../../types/video-fetcher";

/**
 * Fetch all videos from the database with improved performance
 */
export const fetchVideosFromDatabase = async (): Promise<any[]> => {
  try {
    console.log("Fetching videos from database with proper uploaded_at sorting...");
    
    // Primary query sorted by uploaded_at with reduced limit for faster initial load
    const { data: mainData, error: mainError } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, updated_at, description, youtube_channels(thumbnail_url)")
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false }) // Sort by uploaded_at
      .limit(50); // Reduced from 150 to 50 for faster loading
      
    if (!mainError && mainData && mainData.length > 0) {
      console.log(`Successfully fetched ${mainData.length} videos sorted by uploaded_at`);
      
      // Ensure data is properly sorted client-side as well
      const sortedData = mainData.sort((a, b) => {
        const dateA = new Date(a.uploaded_at).getTime();
        const dateB = new Date(b.uploaded_at).getTime();
        return dateB - dateA; // Newest first
      });
      
      return sortedData.map(video => ({
        ...video,
        views: video.views !== null ? parseInt(String(video.views)) : 0
      }));
    }
    
    // Try simplified query if full query fails
    const { data: simpleData, error: simpleError } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, updated_at")
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false }) // Sort by uploaded_at
      .limit(50); // Reduced from 150 to 50 for faster loading
      
    if (!simpleError && simpleData && simpleData.length > 0) {
      console.log(`Successfully fetched ${simpleData.length} videos with simplified query, sorted by uploaded_at`);
      
      return simpleData.map(video => ({
        ...video,
        views: video.views !== null ? parseInt(String(video.views)) : 0
      }));
    }
    
    // Try edge function as fallback
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
        if (result.data && Array.isArray(result.data) && result.data.length > 0) {
          console.log(`Retrieved ${result.data.length} videos with edge function (sorted by uploaded_at)`);
          return result.data;
        }
      }
    } catch (edgeError) {
      console.warn("Edge function error:", edgeError);
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
    
    // Try simple query first with minimal fields for faster loading
    const { data, error } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, updated_at")
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false }) // Sort by uploaded_at
      .limit(50); // Reduced from 150 to 50 for faster loading

    if (!error && data && data.length > 0) {
      console.log(`Successfully fetched ${data.length} videos, sorted by uploaded_at`);
      return data.map(video => ({
        ...video,
        views: video.views !== null ? parseInt(String(video.views)) : 0
      }));
    }
    
    console.error('Error fetching updated videos:', error);
    return [];
  } catch (error) {
    console.error("Error in fetchUpdatedVideosAfterSync:", error);
    return [];
  }
};
