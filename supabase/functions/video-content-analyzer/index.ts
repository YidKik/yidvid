import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { analyzeThumbnail, verdictToRow, GatewayError } from "../_shared/modesty-vision.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const client = () =>
  createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = client();
    const body = await req.json().catch(() => ({}));
    const { action, videoId, title, description, thumbnailUrl, channelName } = body;

    // ---- Analyze a single stored video (by database id) ----
    if (action === "analyze-single") {
      const { data: video, error } = await supabase
        .from("youtube_videos")
        .select("id, video_id, title, description, thumbnail, channel_name")
        .eq("id", videoId)
        .maybeSingle();

      if (error || !video) return json({ error: "Video not found" }, 404);

      const verdict = await analyzeThumbnail({
        title: video.title,
        description: video.description,
        channelName: video.channel_name,
        thumbnailUrl: video.thumbnail,
      });
      const row = verdictToRow(verdict);

      const { error: updateError } = await supabase
        .from("youtube_videos")
        .update(row)
        .eq("id", video.id);
      if (updateError) return json({ error: updateError.message }, 500);

      await supabase.from("content_analysis_logs").insert({
        video_id: video.id,
        analysis_stage: "thumbnail_vision",
        stage_result: row.analysis_details,
      });

      return json({ success: true, verdict, status: row.content_analysis_status });
    }

    // ---- Analyze an incoming video before it is stored (channel processor) ----
    if (!action && (videoId || title !== undefined)) {
      const verdict = await analyzeThumbnail({
        title,
        description,
        channelName,
        thumbnailUrl,
      });
      const row = verdictToRow(verdict);

      return json({
        success: true,
        status: row.content_analysis_status,
        approved: row.content_analysis_status === "approved",
        manualReview: row.manual_review_required,
        finalScore: row.analysis_score,
        reasoning: verdict.reasons.join(" "),
        details: row.analysis_details,
        // Blocked videos are still stored (soft state), never shown.
        shouldStore: true,
      });
    }

    return json({ error: "Invalid action" }, 400);
  } catch (error) {
    const status = error instanceof GatewayError ? error.status : 500;
    console.error("video-content-analyzer error:", error);
    return json({ error: (error as Error).message, gatewayStatus: status }, status === 429 ? 429 : 500);
  }
});
