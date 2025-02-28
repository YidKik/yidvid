
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface YouTubeVideo {
  id: {
    videoId: string;
  };
  snippet: {
    publishedAt: string;
    title: string;
    description: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
    channelId: string;
    channelTitle: string;
  };
}

export async function processChannel(channelId: string, videos: YouTubeVideo[]) {
  console.log(`Processing ${videos.length} videos for channel ${channelId}`);
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
      console.error(`Error fetching channel details for ${channelId}:`, channelError);
      // Don't return, continue with processing
    }

    // Get existing videos for this channel
    const { data: existingVideos, error: videosError } = await supabase
      .from("youtube_videos")
      .select("video_id")
      .eq("channel_id", channelId)
      .is("deleted_at", null);

    if (videosError) {
      console.error(`Error fetching existing videos for ${channelId}:`, videosError);
      return { success: false, error: videosError.message, newVideos: 0 };
    }

    // Create a set of existing video IDs for faster lookup
    const existingVideoIds = new Set(existingVideos?.map(v => v.video_id) || []);

    // Process each video
    for (const video of videos) {
      const videoId = video.id.videoId;
      
      // Skip if we already have this video
      if (existingVideoIds.has(videoId)) {
        continue;
      }

      try {
        // Insert the new video
        const { error: insertError } = await supabase
          .from("youtube_videos")
          .insert({
            video_id: videoId,
            title: video.snippet.title,
            description: video.snippet.description || "",
            thumbnail: video.snippet.thumbnails.high.url,
            channel_id: video.snippet.channelId,
            channel_name: video.snippet.channelTitle,
            uploaded_at: video.snippet.publishedAt,
            category: channelData?.default_category || "other",
          });

        if (insertError) {
          console.error(`Error inserting video ${videoId}:`, insertError);
          errors++;
        } else {
          newVideos++;
          console.log(`Added new video: ${videoId} - ${video.snippet.title}`);
        }
      } catch (error) {
        console.error(`Error processing video ${videoId}:`, error);
        errors++;
      }
    }

    // Update channel last_fetch timestamp
    const { error: updateError } = await supabase
      .from("youtube_channels")
      .update({ last_fetch: new Date().toISOString() })
      .eq("channel_id", channelId);

    if (updateError) {
      console.error(`Error updating last_fetch for channel ${channelId}:`, updateError);
    }

    // Log the result
    await supabase
      .from("youtube_update_logs")
      .insert({
        channel_id: channelId,
        videos_count: newVideos,
        error: errors > 0 ? `${errors} errors occurred` : null,
      });

    return { success: true, newVideos, errors };
  } catch (error) {
    console.error(`Error in processChannel for ${channelId}:`, error);
    return { success: false, error: error.message, newVideos };
  }
}
