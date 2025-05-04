
// Import any necessary modules
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Create a Supabase client using environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function processChannel(channelId: string, videos: any[]) {
  try {
    console.log(`[Channel Processor] Processing ${videos.length} videos for channel ${channelId}`);
    
    if (!videos || videos.length === 0) {
      console.log(`[Channel Processor] No videos to process for channel ${channelId}`);
      return { newVideos: 0 };
    }
    
    // Get existing videos for this channel to avoid duplicates
    const { data: existingVideos, error: fetchError } = await supabase
      .from("youtube_videos")
      .select("video_id")
      .eq("channel_id", channelId)
      .is("deleted_at", null);
      
    if (fetchError) {
      console.error(`[Channel Processor] Error fetching existing videos: ${fetchError.message}`);
      throw fetchError;
    }
    
    // Create a set of existing video IDs for fast lookup
    const existingVideoIds = new Set(existingVideos?.map(v => v.video_id) || []);
    console.log(`[Channel Processor] Found ${existingVideoIds.size} existing videos for channel ${channelId}`);
    
    // Filter out videos that already exist in our database
    const newVideos = videos.filter(video => !existingVideoIds.has(video.video_id));
    console.log(`[Channel Processor] Found ${newVideos.length} new videos for channel ${channelId}`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Insert new videos in batches to avoid errors with large payloads
    const batchSize = 20;
    for (let i = 0; i < newVideos.length; i += batchSize) {
      const batch = newVideos.slice(i, i + batchSize);
      
      // Add the updated_at field that was missing before
      const videosWithUpdatedAt = batch.map(video => ({
        ...video,
        updated_at: new Date().toISOString()
      }));
      
      // Insert the batch of videos
      const { data: insertedVideos, error: insertError } = await supabase
        .from("youtube_videos")
        .insert(videosWithUpdatedAt)
        .select();
        
      if (insertError) {
        console.error(`[Channel Processor] Error inserting videos batch: ${insertError.message}`);
        errorCount += batch.length;
      } else {
        console.log(`[Channel Processor] Successfully inserted ${insertedVideos?.length || 0} videos`);
        successCount += insertedVideos?.length || 0;
      }
    }
    
    // Update the last_fetch timestamp for the channel
    const { error: updateError } = await supabase
      .from("youtube_channels")
      .update({ last_fetch: new Date().toISOString() })
      .eq("channel_id", channelId);
      
    if (updateError) {
      console.error(`[Channel Processor] Error updating channel last_fetch: ${updateError.message}`);
    }
    
    console.log(`[Channel Processor] Completed processing channel ${channelId}: ${successCount} new videos, ${errorCount} errors`);
    
    return { 
      newVideos: successCount,
      errors: errorCount
    };
  } catch (error) {
    console.error(`[Channel Processor] Error processing channel ${channelId}:`, error);
    return { newVideos: 0, error: error.message };
  }
}
