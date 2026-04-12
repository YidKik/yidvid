import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Parse ISO 8601 duration to seconds
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return parseInt(match[1] || '0') * 3600 + parseInt(match[2] || '0') * 60 + parseInt(match[3] || '0');
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const apiKey = Deno.env.get("YOUTUBE_API_KEY") || "";
    const fallbackApiKey = Deno.env.get("YOUTUBE_FALLBACK_API_KEY") || apiKey;

    if (!apiKey) {
      throw new Error("YOUTUBE_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    const batchSize = body.batchSize || 50; // Videos per YouTube API call (max 50)
    const maxBatches = body.maxBatches || 20; // Max number of API calls to make
    const dryRun = body.dryRun || false;

    // Get all videos that haven't been checked for shorts yet
    // We'll process videos that are currently is_short=false and check if they're actually shorts
    const { data: videos, error: fetchError } = await supabase
      .from("youtube_videos")
      .select("id, video_id, title, is_short")
      .eq("is_short", false)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(batchSize * maxBatches);

    if (fetchError) {
      throw new Error(`Failed to fetch videos: ${fetchError.message}`);
    }

    console.log(`[Shorts Backfill] Found ${videos?.length || 0} videos to check`);

    if (!videos || videos.length === 0) {
      return new Response(JSON.stringify({ 
        message: "No videos to process", 
        processed: 0, 
        shortsFound: 0 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // First pass: check titles for #Shorts (free, no API cost)
    const titleShorts: string[] = [];
    const needsApiCheck: typeof videos = [];

    for (const video of videos) {
      if (video.title.toLowerCase().includes('#shorts')) {
        titleShorts.push(video.id);
      } else {
        needsApiCheck.push(video);
      }
    }

    console.log(`[Shorts Backfill] Found ${titleShorts.length} shorts by title match`);

    // Update title-matched shorts immediately (no API cost)
    if (titleShorts.length > 0 && !dryRun) {
      for (let i = 0; i < titleShorts.length; i += 100) {
        const batch = titleShorts.slice(i, i + 100);
        const { error: updateError } = await supabase
          .from("youtube_videos")
          .update({ is_short: true })
          .in("id", batch);

        if (updateError) {
          console.error(`[Shorts Backfill] Error updating title-matched shorts:`, updateError);
        }
      }
    }

    // Second pass: check duration via YouTube API
    let apiShortsFound = 0;
    let apiCallsMade = 0;
    let quotaExceeded = false;

    for (let i = 0; i < needsApiCheck.length && apiCallsMade < maxBatches && !quotaExceeded; i += batchSize) {
      const batch = needsApiCheck.slice(i, i + batchSize);
      const videoIds = batch.map(v => v.video_id).join(',');

      let currentKey = apiKey;
      let response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${currentKey}`,
        { headers: { 'Accept': 'application/json' } }
      );

      // Try fallback key if primary fails
      if ((response.status === 403 || response.status === 429) && fallbackApiKey !== apiKey) {
        console.log(`[Shorts Backfill] Primary key failed, trying fallback`);
        currentKey = fallbackApiKey;
        response = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${currentKey}`,
          { headers: { 'Accept': 'application/json' } }
        );
      }

      apiCallsMade++;

      if (!response.ok) {
        const errorText = await response.text();
        if (errorText.includes('quotaExceeded') || response.status === 403) {
          console.log(`[Shorts Backfill] Quota exceeded after ${apiCallsMade} API calls`);
          quotaExceeded = true;
          break;
        }
        console.error(`[Shorts Backfill] API error:`, errorText);
        continue;
      }

      const data = await response.json();
      const shortsInBatch: string[] = [];

      for (const item of (data.items || [])) {
        const duration = parseDuration(item.contentDetails?.duration || '');
        if (duration > 0 && duration <= 60) {
          const dbVideo = batch.find(v => v.video_id === item.id);
          if (dbVideo) {
            shortsInBatch.push(dbVideo.id);
          }
        }
      }

      if (shortsInBatch.length > 0 && !dryRun) {
        const { error: updateError } = await supabase
          .from("youtube_videos")
          .update({ is_short: true })
          .in("id", shortsInBatch);

        if (updateError) {
          console.error(`[Shorts Backfill] Error updating shorts:`, updateError);
        }
      }

      apiShortsFound += shortsInBatch.length;
      console.log(`[Shorts Backfill] Batch ${apiCallsMade}: checked ${batch.length} videos, found ${shortsInBatch.length} shorts`);

      // Small delay between API calls
      if (i + batchSize < needsApiCheck.length) {
        await new Promise(r => setTimeout(r, 200));
      }
    }

    const totalShortsFound = titleShorts.length + apiShortsFound;
    const result = {
      message: "Shorts backfill completed",
      totalVideosChecked: videos.length,
      titleMatchShorts: titleShorts.length,
      apiCheckShorts: apiShortsFound,
      totalShortsFound,
      apiCallsMade,
      quotaExceeded,
      remainingUnchecked: needsApiCheck.length - (apiCallsMade * batchSize),
      dryRun,
    };

    console.log(`[Shorts Backfill] Complete:`, JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[Shorts Backfill] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
