
import { supabase } from "@/integrations/supabase/client";
import { VideoData } from "../../types/video-fetcher";

/**
 * Fetch all videos from the database with improved performance
 */
export const fetchVideosFromDatabase = async (): Promise<any[]> => {
  try {
    console.log("Fetching videos from database with high priority...");
    
    // Try a direct query with more fields but limited to most recent videos
    const { data: directData, error: directError } = await supabase
      .from("youtube_videos")
      .select("*")
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false })
      .limit(24);
      
    if (!directError && directData && directData.length > 0) {
      console.log(`Successfully fetched ${directData.length} videos directly`);
      return directData;
    }
    
    if (directError) {
      console.warn("Direct query failed, trying alternative approach:", directError);
    }
    
    // Use a more efficient query with fewer fields as backup
    const { data: initialData, error: initialError } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at")
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false })
      .limit(24);
      
    if (!initialError && initialData && initialData.length > 0) {
      console.log(`Successfully fetched ${initialData.length} videos (initial batch)`);
      return initialData;
    }
    
    if (initialError) {
      console.warn("Initial query error, trying alternative approach:", initialError);
    }
    
    // Try with a more simplified query if the first ones failed
    try {
      // Try with public access that doesn't require auth
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at")
        .order("uploaded_at", { ascending: false })
        .limit(24);

      if (error) {
        console.error("Error fetching videos with simplified query:", error);
        // Try an even more basic query without filters
        const { data: basicData, error: basicError } = await supabase
          .from("youtube_videos")
          .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at")
          .limit(16);
          
        if (basicError) {
          console.error("Error with basic query:", basicError);
          throw basicError;
        }
        
        if (basicData && basicData.length > 0) {
          console.log(`Got ${basicData.length} videos with basic query`);
          return basicData;
        }
      }
      
      if (data && data.length > 0) {
        console.log(`Successfully fetched ${data.length} videos from simplified query`);
        return data;
      }
      
      console.log("No videos found in database with simplified query");
    } catch (simplifiedError) {
      console.error("Error in simplified fetch:", simplifiedError);
    }
    
    // If all database queries fail, create sample videos
    return createSampleVideos(12);
  } catch (err) {
    console.error("Failed to fetch videos from database:", err);
    return createSampleVideos(12);
  }
};

/**
 * Background fetch of additional videos
 */
const fetchAdditionalVideos = async (skipCount: number): Promise<void> => {
  try {
    console.log("Loading additional videos in background...");
    
    const { data } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at")
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false })
      .range(skipCount, skipCount + 24);
      
    if (data && data.length > 0) {
      console.log(`Successfully loaded ${data.length} additional videos in background`);
      // Cache in React Query will be updated elsewhere
    }
  } catch (err) {
    console.error("Background fetch error:", err);
  }
};

/**
 * Fetch updated videos after syncing with YouTube
 * with improved performance
 */
export const fetchUpdatedVideosAfterSync = async (): Promise<any[]> => {
  try {
    console.log("Fetching updated videos after sync...");
    
    // Get only needed fields, optimized number
    const { data, error } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, category, description")
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false })
      .limit(24);

    if (error) {
      console.error('Error fetching updated videos:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log("No updated videos found");
      return [];
    }
    
    console.log(`Successfully fetched ${data?.length || 0} updated videos`);
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
