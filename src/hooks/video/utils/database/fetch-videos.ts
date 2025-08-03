
import { supabase } from "@/integrations/supabase/client";
import { VideoData } from "../../types/video-fetcher";

/**
 * Fetch all videos from the database with improved performance
 */
export const fetchVideosFromDatabase = async (): Promise<any[]> => {
  try {
    console.log("Fetching videos from database with proper uploaded_at sorting...");
    
    // Primary query sorted by uploaded_at with increased limit
    const { data: mainData, error: mainError } = await supabase
      .from("youtube_videos")
      .select("*, youtube_channels(thumbnail_url)")
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false }) // Sort by uploaded_at
      .limit(150);
      
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
      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, updated_at, category, description")
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false }) // Sort by uploaded_at
      .limit(150);
      
    if (!simpleError && simpleData && simpleData.length > 0) {
      console.log(`Successfully fetched ${simpleData.length} videos with simplified query, sorted by uploaded_at`);
      
      return simpleData.map(video => ({
        ...video,
        views: video.views !== null ? parseInt(String(video.views)) : 0
      }));
    }
    
    if (simpleError) {
      console.warn("Simple query failed:", simpleError);
      
      try {
        // Try edge function as fallback only if database queries fail
        const response = await fetch("https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/get-public-videos", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Use Supabase client instead of direct fetch
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
      
      // Try minimal query as last resort
      const { data: minimalData, error: minimalError } = await supabase
        .from("youtube_videos")
        .select("*")
        .order("uploaded_at", { ascending: false }) // Sort by uploaded_at
        .limit(100);
        
      if (!minimalError && minimalData && minimalData.length > 0) {
        console.log(`Retrieved ${minimalData.length} videos with minimal query, sorted by uploaded_at`);
        
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
    
    // Try full data query first with explicit uploaded_at ordering
    const { data: fullData, error: fullError } = await supabase
      .from("youtube_videos")
      .select("*, youtube_channels(thumbnail_url)")
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false }) // Sort by uploaded_at
      .limit(150);
      
    if (!fullError && fullData && fullData.length > 0) {
      console.log(`Successfully fetched ${fullData.length} videos with full data, sorted by uploaded_at`);
      return fullData.map(video => ({
        ...video,
        views: video.views !== null ? parseInt(String(video.views)) : 0
      }));
    }
    
    // Try simpler query next
    const { data, error } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, updated_at, category, description")
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false }) // Sort by uploaded_at
      .limit(150);

    if (error) {
      console.error('Error fetching updated videos:', error);
      
      // Try simpler approach if that fails
      const { data: basicData, error: basicError } = await supabase
        .from("youtube_videos")
        .select("*")
        .is("deleted_at", null)
        .order("uploaded_at", { ascending: false }) // Sort by uploaded_at
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
    
    console.log(`Successfully fetched ${data?.length || 0} updated videos, sorted by uploaded_at`);
    
    return data.map(video => ({
      ...video,
      views: video.views !== null ? parseInt(String(video.views)) : 0
    }));
  } catch (error) {
    console.error("Error in fetchUpdatedVideosAfterSync:", error);
    return [];
  }
};
