import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function logFetchAttempt(
  channelsProcessed: number,
  videosFound: number,
  quotaRemaining?: number,
  error?: string
) {
  try {
    const { error: insertError } = await supabase
      .from("video_fetch_logs")
      .insert({
        channels_processed: channelsProcessed,
        videos_found: videosFound,
        quota_remaining: quotaRemaining,
        error: error || null,
        fetch_time: new Date().toISOString()
      });

    if (insertError) {
      console.error("Failed to log fetch attempt:", insertError);
    }
  } catch (err) {
    console.error("Error logging fetch attempt:", err);
  }
}