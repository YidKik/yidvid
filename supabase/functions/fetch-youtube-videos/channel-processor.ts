
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function processChannel(channelId: string, videos: any[]) {
  console.log(`[Channel Processor] Processing ${videos.length} videos for channel ${channelId}`);
  let newVideos = 0;
  let errors = 0;

  try {
    // Get channel details
    const { data: channelData, error: channelError } = await supabase
      .from("youtube_channels")
      .select("title, default_category")
      .eq("channel_id", channelId)
      .single();

    if (channelError) {
      console.error(`[Channel Processor] Error fetching channel details for ${channelId}:`, channelError);
      // Continue processing with available information
    }

    // Get existing videos for this channel to avoid duplicates
    const { data: existingVideos, error: videosError } = await supabase
      .from("youtube_videos")
      .select("video_id")
      .eq("channel_id", channelId)
      .is("deleted_at", null);

    if (videosError) {
      console.error(`[Channel Processor] Error fetching existing videos for ${channelId}:`, videosError);
      return { success: false, error: videosError.message, newVideos: 0 };
    }

    // Create a set of existing video IDs for faster lookup
    const existingVideoIds = new Set(existingVideos?.map(v => v.video_id) || []);

    console.log(`[Channel Processor] Found ${existingVideoIds.size} existing videos for channel ${channelId}`);

    // Filter out videos that already exist
    const newVideosList = videos.filter(video => !existingVideoIds.has(video.video_id));
    
    console.log(`[Channel Processor] Found ${newVideosList.length} new videos for channel ${channelId}`);

    // Process each new video
    for (const video of newVideosList) {
      try {
        // Prepare video data with channel's default category if available
        const videoData = {
          video_id: video.video_id,
          title: video.title,
          description: video.description || "",
          thumbnail: video.thumbnail,
          channel_id: video.channel_id,
          channel_name: video.channel_name,
          uploaded_at: video.uploaded_at,
          views: video.views || 0,
          category: channelData?.default_category || "other",
        };

        // Insert the new video
        const { error: insertError } = await supabase
          .from("youtube_videos")
          .insert(videoData);

        if (insertError) {
          console.error(`[Channel Processor] Error inserting video ${video.video_id}:`, insertError);
          errors++;
        } else {
          newVideos++;
          console.log(`[Channel Processor] Added new video: ${video.video_id} - ${video.title}`);
        }
      } catch (error) {
        console.error(`[Channel Processor] Error processing video ${video.video_id}:`, error);
        errors++;
      }
    }

    // Update channel last_fetch timestamp
    const { error: updateError } = await supabase
      .from("youtube_channels")
      .update({ 
        last_fetch: new Date().toISOString(),
        fetch_error: null 
      })
      .eq("channel_id", channelId);

    if (updateError) {
      console.error(`[Channel Processor] Error updating last_fetch for channel ${channelId}:`, updateError);
    }

    // Log the result
    await supabase
      .from("youtube_update_logs")
      .insert({
        channel_id: channelId,
        videos_count: newVideos,
        error: errors > 0 ? `${errors} errors occurred` : null,
      });

    console.log(`[Channel Processor] Completed processing channel ${channelId}: ${newVideos} new videos, ${errors} errors`);
    return { success: true, newVideos, errors };
  } catch (error) {
    console.error(`[Channel Processor] Error in processChannel for ${channelId}:`, error);
    return { success: false, error: error.message, newVideos };
  }
}
