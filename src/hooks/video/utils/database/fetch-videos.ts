
import { supabase } from "@/integrations/supabase/client";
import { VideoData } from "../../types/video-fetcher";

/**
 * Fetch all videos from the database with improved error handling
 */
export const fetchVideosFromDatabase = async (): Promise<any[]> => {
  try {
    console.log("Fetching videos from database...");
    
    // Try direct query first without RLS concerns
    const { data: directData, error: directError } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, category, description")
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false })
      .limit(200);
      
    if (!directError && directData && directData.length > 0) {
      console.log(`Successfully fetched ${directData.length} videos directly`);
      return directData;
    }
    
    if (directError) {
      console.warn("Direct query error, trying alternative approach:", directError);
    }
    
    // Try with a more simplified query if the first one failed
    const { data, error } = await supabase
      .from("youtube_videos")
      .select("*")
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("Error fetching videos from database:", error);
      
      // Try one more query with minimal selection and no filters
      const minimalQuery = await supabase
        .from("youtube_videos")
        .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at")
        .limit(100);
        
      if (!minimalQuery.error && minimalQuery.data?.length > 0) {
        console.log(`Retrieved ${minimalQuery.data.length} videos with minimal query`);
        return minimalQuery.data;
      }
      
      // Create sample videos as fallback
      return createSampleVideos(8);
    }
    
    if (!data || data.length === 0) {
      console.log("No videos found in database");
      return [];
    }
    
    console.log(`Successfully fetched ${data?.length || 0} videos from database, most recent: ${new Date(data[0].uploaded_at).toLocaleString()}`);
    return data;
  } catch (err) {
    console.error("Failed to fetch videos from database:", err);
    
    // Try one last simple query with no filters at all
    try {
      const simpleQuery = await supabase
        .from("youtube_videos")
        .select("*")
        .limit(50);
        
      if (!simpleQuery.error && simpleQuery.data?.length > 0) {
        console.log(`Retrieved ${simpleQuery.data.length} videos with fallback simple query`);
        return simpleQuery.data;
      }
    } catch (e) {
      console.error("Also failed with simple query:", e);
    }
    
    // Create emergency sample videos
    return createSampleVideos(8);
  }
};

/**
 * Fetch updated videos after syncing with YouTube
 */
export const fetchUpdatedVideosAfterSync = async (): Promise<any[]> => {
  try {
    console.log("Fetching updated videos after sync...");
    
    // Get most recent videos first, limited to 200
    const { data, error } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, category, description")
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error('Error fetching updated videos:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log("No updated videos found");
      return [];
    }
    
    console.log(`Successfully fetched ${data?.length || 0} updated videos, most recent: ${new Date(data[0].uploaded_at).toLocaleString()}`);
    return data;
  } catch (error) {
    console.error("Error in fetchUpdatedVideosAfterSync:", error);
    return [];
  }
};

// Helper function to create sample videos
const createSampleVideos = (count: number): any[] => {
  console.warn(`Creating ${count} sample videos as fallback`);
  const now = new Date();
  return Array(count).fill(null).map((_, i) => ({
    id: `sample-${i}`,
    video_id: `sample-vid-${i}`,
    title: `Sample Video ${i+1}`,
    thumbnail: '/placeholder.svg',
    channel_name: "Sample Channel",
    channel_id: "sample-channel",
    views: 1000 * (i+1),
    uploaded_at: new Date(now.getTime() - (i * 86400000)).toISOString(),
    category: "other",
    description: "This is a sample video until real content loads."
  }));
};
