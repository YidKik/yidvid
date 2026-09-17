// Resumable batch re-scan of the existing library using Lovable AI vision.
// Each invocation processes one bounded batch and updates the job row.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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

const MAX_BATCH = 25;
const LEASE_MS = 5 * 60 * 1000;

const client = () =>
  createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

async function getJob(supabase: any) {
  const { data } = await supabase
    .from("content_scan_jobs")
    .select("*")
    .eq("singleton", true)
    .maybeSingle();
  return data;
}

async function updateJob(supabase: any, patch: Record<string, unknown>) {
  const { data } = await supabase
    .from("content_scan_jobs")
    .update(patch)
    .eq("singleton", true)
    .select("*")
    .maybeSingle();
  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = client();

  try {
    const body = await req.json().catch(() => ({}));
    const action: string = body.action || "run";
    const batchSize = Math.min(Number(body.batchSize) || 10, MAX_BATCH);

    let job = await getJob(supabase);
    if (!job) return json({ error: "Scan job row missing" }, 500);

    if (action === "status") return json({ success: true, job });

    if (action === "start") {
      job = await updateJob(supabase, {
        status: "running",
        pause_reason: null,
        last_error: null,
        started_at: job.started_at ?? new Date().toISOString(),
        lease_until: null,
      });
      return json({ success: true, job });
    }

    if (action === "pause") {
      job = await updateJob(supabase, { status: "paused", pause_reason: "Paused by admin" });
      return json({ success: true, job });
    }

    if (action === "reset") {
      job = await updateJob(supabase, {
        status: "idle",
        pause_reason: null,
        last_error: null,
        cursor_created_at: null,
        cursor_id: null,
        processed_count: 0,
        approved_count: 0,
        blocked_count: 0,
        review_count: 0,
        error_count: 0,
        started_at: null,
        lease_until: null,
      });
      return json({ success: true, job });
    }

    // ---- action === "run": process one bounded batch ----
    if (job.status !== "running") {
      return json({ success: true, skipped: true, reason: `Job is ${job.status}`, job });
    }

    // Single-flight lease
    const now = Date.now();
    if (job.lease_until && new Date(job.lease_until).getTime() > now) {
      return json({ success: true, skipped: true, reason: "Another batch is running", job });
    }
    job = await updateJob(supabase, {
      lease_until: new Date(now + LEASE_MS).toISOString(),
      last_run_at: new Date().toISOString(),
    });

    // Fetch the next page, ordered by created_at then id (stable cursor).
    let query = supabase
      .from("youtube_videos")
      .select("id, video_id, title, description, thumbnail, channel_name, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .limit(batchSize);

    if (job.cursor_created_at) {
      query = query.or(
        `created_at.gt.${job.cursor_created_at},and(created_at.eq.${job.cursor_created_at},id.gt.${job.cursor_id})`,
      );
    }

    const { data: videos, error: fetchError } = await query;
    if (fetchError) throw new Error(fetchError.message);

    if (!videos || videos.length === 0) {
      job = await updateJob(supabase, { status: "completed", lease_until: null });
      return json({ success: true, done: true, job });
    }

    let approved = 0;
    let blocked = 0;
    let review = 0;
    let errors = 0;
    let cursorCreatedAt = job.cursor_created_at;
    let cursorId = job.cursor_id;
    let paused: string | null = null;

    for (const video of videos) {
      try {
        const verdict = await analyzeThumbnail({
          title: video.title,
          description: video.description,
          channelName: video.channel_name,
          thumbnailUrl: video.thumbnail,
        });
        const row = verdictToRow(verdict);

        await supabase.from("youtube_videos").update(row).eq("id", video.id);

        if (row.content_analysis_status === "approved") approved++;
        else if (row.content_analysis_status === "rejected") blocked++;
        else review++;
      } catch (error) {
        if (error instanceof GatewayError && (error.status === 402 || error.status === 403)) {
          paused =
            error.status === 402
              ? "AI credits are used up. Add credits to continue the scan."
              : "AI access is blocked for this workspace. Check the AI settings.";
          break;
        }
        if (error instanceof GatewayError && error.status === 429) {
          paused = "AI rate limit reached. The scan will continue when you resume it.";
          break;
        }
        console.error("Scan item failed", video.id, error);
        errors++;
      }

      cursorCreatedAt = video.created_at;
      cursorId = video.id;
    }

    const processedNow = approved + blocked + review + errors;

    job = await updateJob(supabase, {
      cursor_created_at: cursorCreatedAt,
      cursor_id: cursorId,
      processed_count: (job.processed_count || 0) + processedNow,
      approved_count: (job.approved_count || 0) + approved,
      blocked_count: (job.blocked_count || 0) + blocked,
      review_count: (job.review_count || 0) + review,
      error_count: (job.error_count || 0) + errors,
      status: paused ? "paused" : "running",
      pause_reason: paused,
      lease_until: null,
    });

    return json({
      success: true,
      processed: processedNow,
      approved,
      blocked,
      review,
      errors,
      paused,
      job,
    });
  } catch (error) {
    console.error("analyze-existing-videos error:", error);
    await updateJob(supabase, {
      lease_until: null,
      last_error: (error as Error).message,
    }).catch(() => {});
    return json({ success: false, error: (error as Error).message }, 500);
  }
});
