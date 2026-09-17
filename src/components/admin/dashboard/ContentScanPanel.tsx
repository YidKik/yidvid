import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Play, Pause, RotateCcw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface ScanJob {
  status: string;
  pause_reason: string | null;
  processed_count: number;
  approved_count: number;
  blocked_count: number;
  review_count: number;
  error_count: number;
  last_error: string | null;
}

export const ContentScanPanel: React.FC = () => {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const loopRef = useRef(false);

  const { data: job, refetch } = useQuery({
    queryKey: ["content-scan-job"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_scan_jobs")
        .select("*")
        .eq("singleton", true)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as ScanJob;
    },
    refetchInterval: 4000,
  });

  const { data: totalVideos } = useQuery({
    queryKey: ["content-scan-total"],
    queryFn: async () => {
      const { count } = await supabase
        .from("youtube_videos")
        .select("id", { count: "exact", head: true })
        .is("deleted_at", null);
      return count || 0;
    },
    staleTime: 1000 * 60 * 10,
  });

  const call = async (action: string, extra: Record<string, unknown> = {}) => {
    const { data, error } = await supabase.functions.invoke("analyze-existing-videos", {
      body: { action, ...extra },
    });
    if (error) throw new Error(error.message);
    return data;
  };

  // Drives the scan forward one batch at a time while it is running.
  useEffect(() => {
    if (job?.status !== "running" || loopRef.current) return;
    let cancelled = false;
    loopRef.current = true;

    const run = async () => {
      while (!cancelled) {
        try {
          const result: any = await call("run", { batchSize: 10 });
          queryClient.invalidateQueries({ queryKey: ["content-scan-job"] });
          if (result?.done) {
            toast.success("Scan finished — the whole library has been checked.");
            break;
          }
          if (result?.paused) {
            toast.error(result.paused);
            break;
          }
          if (result?.skipped) break;
        } catch (e: any) {
          toast.error(e.message || "The scan stopped unexpectedly.");
          break;
        }
        await new Promise((r) => setTimeout(r, 1500));
      }
      loopRef.current = false;
      refetch();
    };

    run();
    return () => {
      cancelled = true;
      loopRef.current = false;
    };
  }, [job?.status]);

  const handle = async (action: string, message: string) => {
    setBusy(true);
    try {
      await call(action);
      await refetch();
      toast.success(message);
    } catch (e: any) {
      toast.error(e.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const processed = job?.processed_count || 0;
  const total = totalVideos || 0;
  const pct = total > 0 ? Math.min(100, Math.round((processed / total) * 100)) : 0;
  const running = job?.status === "running";

  return (
    <Card className="border-l-4 border-l-[#FF0000]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-5 w-5 text-[#FF0000]" />
          Thumbnail safety scan
          <Badge variant="outline" className="ml-2 capitalize">
            {job?.status || "idle"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Checks every video's thumbnail with AI and hides anything showing women, girls or other
          immodest content. Unclear ones are sent to the review list below.
        </p>

        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>
              {processed.toLocaleString()} of {total.toLocaleString()} videos checked
            </span>
            <span>{pct}%</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          {[
            { label: "Allowed", value: job?.approved_count || 0 },
            { label: "Hidden", value: job?.blocked_count || 0 },
            { label: "To review", value: job?.review_count || 0 },
            { label: "Errors", value: job?.error_count || 0 },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border p-3">
              <p className="text-xl font-bold">{s.value.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {job?.pause_reason && (
          <p className="text-sm text-orange-600 bg-orange-50 dark:bg-orange-950/30 rounded-md p-3">
            {job.pause_reason}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {running ? (
            <Button variant="outline" disabled={busy} onClick={() => handle("pause", "Scan paused.")}>
              {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Pause className="h-4 w-4 mr-2" />}
              Pause scan
            </Button>
          ) : (
            <Button disabled={busy} onClick={() => handle("start", "Scan started.")}>
              {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
              {processed > 0 ? "Resume scan" : "Start scan"}
            </Button>
          )}
          <Button
            variant="ghost"
            disabled={busy || running}
            onClick={() => handle("reset", "Scan reset to the beginning.")}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Start over
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
