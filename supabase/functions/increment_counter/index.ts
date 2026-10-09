// View counts now come only from YouTube (daily sync-video-stats job).
// YidVid plays no longer modify youtube_videos.views; this endpoint is kept
// so older app builds calling it keep working without errors.
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  return new Response(JSON.stringify({ success: true, counted: false, reason: "views come from YouTube" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
