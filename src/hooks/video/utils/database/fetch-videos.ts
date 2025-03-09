
import { supabase } from "@/integrations/supabase/client";
import { VideoData } from "../../types/video-fetcher";

/**
 * Fetch all videos from the database with improved performance
 */
export const fetchVideosFromDatabase = async (): Promise<any[]> => {
  try {
    console.log("Fetching videos from database...");
    
    // Use a more efficient query with fewer fields first
    const { data: initialData, error: initialError } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at")
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false })
      .limit(50); // Reduced from 100 to 50 for faster initial load
      
    if (!initialError && initialData && initialData.length > 0) {
      console.log(`Successfully fetched ${initialData.length} videos (initial batch)`);
      
      // Start loading additional videos in the background with lower priority
      setTimeout(() => {
        fetchAdditionalVideos(initialData.length).catch(err => {
          console.warn("Background fetch error:", err);
        });
      }, 2000); // Delay background loading to prioritize main page display
      
      return initialData;
    }
    
    if (initialError) {
      console.warn("Initial query error, trying alternative approach:", initialError);
    }
    
    // Try with a more simplified query if the first one failed
    const { data, error } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at")
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false })
      .limit(30); // Reduced from 50 to 30

    if (error) {
      console.error("Error fetching videos from database:", error);
      
      // Create sample videos as fallback
      return createSampleVideos(8);
    }
    
    if (!data || data.length === 0) {
      console.log("No videos found in database");
      return [];
    }
    
    console.log(`Successfully fetched ${data?.length || 0} videos from database`);
    return data;
  } catch (err) {
    console.error("Failed to fetch videos from database:", err);
    return createSampleVideos(8);
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
      .range(skipCount, skipCount + 49); // Reduced range from 99 to 49
      
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
    
    // Get only needed fields, limited to 50 (reduced from 100)
    const { data, error } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at")
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false })
      .limit(50);

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
