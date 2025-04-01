
import { supabase } from "@/integrations/supabase/client";

/**
 * Primary query that fetches videos with optimal field selection
 */
const fetchPrimaryVideoQuery = async () => {
  try {
    const { data, error } = await supabase
      .from('youtube_videos')
      .select(`
        id, 
        video_id, 
        title, 
        thumbnail, 
        channel_name, 
        channel_id, 
        views, 
        uploaded_at,
        youtube_channels(thumbnail_url)
      `)
      .is('deleted_at', null)
      .order('uploaded_at', { ascending: false })
      .limit(150);
    
    if (error) {
      console.error("Primary video query failed:", error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error("Error in primary video query:", error);
    return { data: null, error };
  }
};

/**
 * Fallback query with more fields in case the primary query fails
 */
const fetchFallbackVideoQuery = async () => {
  try {
    const { data, error } = await supabase
      .from('youtube_videos')
      .select(`
        id, 
        video_id, 
        title, 
        thumbnail, 
        channel_name, 
        channel_id, 
        views, 
        uploaded_at, 
        category, 
        description,
        youtube_channels(thumbnail_url)
      `)
      .is('deleted_at', null)
      .order('uploaded_at', { ascending: false })
      .limit(150);
    
    if (error) {
      console.error("Fallback video query also failed:", error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error("Error in fallback video query:", error);
    return { data: null, error };
  }
};

/**
 * Last resort query with minimal fields when other queries fail
 */
const fetchLastResortVideoQuery = async () => {
  try {
    const { data, error } = await supabase
      .from('youtube_videos')
      .select('*')
      .order('uploaded_at', { ascending: false })
      .limit(100);
      
    if (error) {
      console.error("Last resort query failed:", error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error("Error in last resort video query:", error);
    return { data: null, error };
  }
};

/**
 * Direct database query for fetching videos
 * with multiple fallback strategies for reliability
 */
export const performDirectDatabaseQuery = async (): Promise<any[]> => {
  // Try the primary query first
  const { data: primaryData, error: primaryError } = await fetchPrimaryVideoQuery();
  
  if (!primaryError && primaryData) {
    console.log(`Successfully fetched ${primaryData.length} videos with primary query`);
    return primaryData;
  }
  
  // If primary query fails, try the fallback query
  const { data: fallbackData, error: fallbackError } = await fetchFallbackVideoQuery();
  
  if (!fallbackError && fallbackData) {
    console.log(`Successfully fetched ${fallbackData.length} videos with fallback query`);
    return fallbackData;
  }
  
  // If both previous queries fail, try the last resort query
  const { data: lastResortData } = await fetchLastResortVideoQuery();
  
  if (lastResortData) {
    console.log(`Successfully fetched ${lastResortData.length} videos with last resort query`);
    return lastResortData;
  }
  
  // If all queries fail, return an empty array
  console.error("All database queries failed, returning empty array");
  return [];
};

/**
 * Fetches videos by channel ID with fallback strategies
 */
export const fetchVideosByChannelId = async (channelId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('youtube_videos')
      .select('*')
      .eq('channel_id', channelId)
      .is('deleted_at', null)
      .order('uploaded_at', { ascending: false });
      
    if (error) {
      console.error(`Error fetching videos for channel ${channelId}:`, error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error(`Error in channel videos fetch for ${channelId}:`, error);
    return [];
  }
};

/**
 * Fetches a single video by ID with fallback strategies
 */
export const fetchVideoById = async (videoId: string): Promise<any> => {
  try {
    // First try to find by video_id
    const { data: videoByVideoId, error: videoByVideoIdError } = await supabase
      .from("youtube_videos")
      .select("*, youtube_channels(thumbnail_url)")
      .eq("video_id", videoId)
      .maybeSingle();

    if (!videoByVideoIdError && videoByVideoId) {
      return videoByVideoId;
    }

    // Check if the id is a valid UUID before querying
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(videoId)) {
      // If not found by video_id, try UUID
      const { data: videoByUuid, error: videoByUuidError } = await supabase
        .from("youtube_videos")
        .select("*, youtube_channels(thumbnail_url)")
        .eq("id", videoId)
        .maybeSingle();

      if (!videoByUuidError && videoByUuid) {
        return videoByUuid;
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching video ${videoId}:`, error);
    return null;
  }
};
