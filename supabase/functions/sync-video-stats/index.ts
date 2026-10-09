// Daily full-library YouTube statistics.viewCount sync.
// Resumable: durable cursor in youtube_stats_sync_runs, lease prevents overlap,
// self-chains in time-bounded chunks. One run per Pacific quota day.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);
const API_KEY = Deno.env.get("YOUTUBE_API_KEY") ?? "";
const BATCH = 50;
const CHUNK_MS = 100_000;
const LEASE_MS = 180_000;
const QUOTA_FLOOR = 500; // leave headroom for content imports
const MAX_ATTEMPTS = 3;
const MAX_LOGGED_IDS = 2000;

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const pacificDate = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(new Date());

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Outcome =
  | { kind: "ok"; items: { id: string; views: number | null }[] }
  | { kind: "quota" }
  | { kind: "failed"; error: string };

async function fetchStats(ids: string[]): Promise<Outcome> {
  let lastErr = "";
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const remaining = await supabase.rpc("reserve_youtube_quota", {
      p_units: 1, p_key_label: "primary", p_source: "sync-video-stats", p_floor: QUOTA_FLOOR,
    });
    if (remaining.error) return { kind: "failed", error: `quota rpc: ${remaining.error.message}` };
    if (remaining.data === -1) return { kind: "quota" };
    try {
      const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics&maxResults=50&id=${ids.join(",")}&key=${API_KEY}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        return {
          kind: "ok",
          items: (data.items ?? []).map((it: any) => {
            const n = Number(it?.statistics?.viewCount);
            return { id: it.id, views: Number.isFinite(n) && n >= 0 ? n : null };
          }),
        };
      }
      const body = await res.text();
      if (res.status === 403 && /quotaExceeded|dailyLimitExceeded|rateLimitExceeded/.test(body)) {
        return { kind: "quota" };
      }
      lastErr = `[${res.status}] ${body.slice(0, 300)}`;
      if (res.status < 500 && res.status !== 429) return { kind: "failed", error: lastErr };
    } catch (e) {
      lastErr = String(e);
    }
    await sleep(1000 * attempt);
  }
  return { kind: "failed", error: lastErr };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (!API_KEY) return json({ error: "YouTube key not configured" }, 500);

  const runDate = pacificDate();
  let { data: run } = await supabase.from("youtube_stats_sync_runs").select("*").eq("run_date", runDate).maybeSingle();

  if (run?.status === "completed") return json({ message: "Already completed today", run });

  if (!run) {
    const { count } = await supabase.from("youtube_videos").select("id", { count: "exact", head: true });
    const ins = await supabase.from("youtube_stats_sync_runs")
      .insert({ run_date: runDate, total_target: count ?? 0, status: "running" }).select().single();
    if (ins.error) {
      // concurrent creator won the unique race
      return json({ message: "Run already being created", error: ins.error.message }, 409);
    }
    run = ins.data;
  }

  // Acquire lease atomically
  const nowIso = new Date().toISOString();
  const lease = await supabase.from("youtube_stats_sync_runs")
    .update({ lease_until: new Date(Date.now() + LEASE_MS).toISOString(), status: "running", last_error: null })
    .eq("id", run.id)
    .or(`lease_until.is.null,lease_until.lt.${nowIso}`)
    .select().maybeSingle();
  if (!lease.data) return json({ message: "Run already in progress", runId: run.id }, 409);
  run = lease.data;

  // Work runs in the background so callers (cron) get an immediate reply.
  // @ts-ignore EdgeRuntime is provided by Supabase
  EdgeRuntime.waitUntil(runChunk(run, runDate, req).catch(async (e) => {
    console.error("chunk crashed", e);
    await supabase.from("youtube_stats_sync_runs").update({ status: "error", last_error: String(e), lease_until: null }).eq("id", run.id);
  }));
  return json({ message: "Chunk started", runId: run.id, processed: run.processed });
});

async function runChunk(run: any, runDate: string, req: Request) {
  const started = Date.now();
  let cursor: string | null = run.cursor_id;
  const totals = {
    processed: run.processed, updated: run.updated, missing: run.missing, failed: run.failed,
    units_used: run.units_used, missing_ids: [...run.missing_ids], failed_ids: [...run.failed_ids],
  };
  let status = "running";
  let lastError: string | null = null;

  while (Date.now() - started < CHUNK_MS) {
    let q = supabase.from("youtube_videos").select("id, video_id").order("id", { ascending: true }).limit(BATCH);
    if (cursor) q = q.gt("id", cursor);
    const { data: rows, error } = await q;
    if (error) { lastError = error.message; status = "error"; break; }
    if (!rows || rows.length === 0) { status = "completed"; break; }

    const ids = [...new Set(rows.map((r) => r.video_id).filter(Boolean))];
    const out = await fetchStats(ids);
    if (out.kind === "quota") { status = "paused_quota"; lastError = "Quota floor reached or quota exhausted"; break; }

    if (out.kind === "failed") {
      totals.failed += ids.length;
      if (totals.failed_ids.length < MAX_LOGGED_IDS) totals.failed_ids.push(...ids);
      lastError = out.error;
    } else {
      const found = out.items.filter((i) => i.views !== null).map((i) => ({ video_id: i.id, views: i.views }));
      const returned = new Set(out.items.map((i) => i.id));
      const missing = ids.filter((id) => !returned.has(id));
      const apply = await supabase.rpc("bulk_apply_video_stats", { p_found: found, p_missing: missing });
      if (apply.error) {
        lastError = apply.error.message; status = "error"; break; // do not advance cursor
      }
      totals.updated += (apply.data as any)?.updated ?? 0;
      totals.missing += missing.length;
      if (totals.missing_ids.length < MAX_LOGGED_IDS) totals.missing_ids.push(...missing);
    }
    // attempts are counted inside reserve_youtube_quota; mirror for the run record
    const { data: u } = await supabase.from("youtube_quota_usage").select("units")
      .eq("source", "sync-video-stats").eq("quota_day_pt", runDate).maybeSingle();
    totals.units_used = u?.units ?? totals.units_used;
    totals.processed += ids.length;
    cursor = rows[rows.length - 1].id;
    if (totals.processed % 1000 === 0) console.log(`progress ${totals.processed}`);

    await supabase.from("youtube_stats_sync_runs").update({
      ...totals, cursor_id: cursor, last_error: lastError,
      lease_until: new Date(Date.now() + LEASE_MS).toISOString(),
    }).eq("id", run.id);
  }

  const finished = status === "completed";
  await supabase.from("youtube_stats_sync_runs").update({
    ...totals, cursor_id: cursor, status, last_error: lastError,
    chunks: run.chunks + 1, lease_until: null,
    finished_at: finished ? new Date().toISOString() : null,
  }).eq("id", run.id);

  if (status === "running") {
    // continue in a fresh invocation
    const self = `${Deno.env.get("SUPABASE_URL")}/functions/v1/sync-video-stats`;
    const auth = req.headers.get("Authorization") ?? "";
    // @ts-ignore EdgeRuntime is provided by Supabase
    await fetch(self, { method: "POST", headers: { "Content-Type": "application/json", Authorization: auth, apikey: req.headers.get("apikey") ?? "" }, body: "{}" }).catch((e) => console.error("self-chain failed", e));
  }
  console.log(`chunk done status=${status} processed=${totals.processed} updated=${totals.updated} missing=${totals.missing} failed=${totals.failed} err=${lastError}`);
}
