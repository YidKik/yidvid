import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, TrendingDown, RefreshCw, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const ApiQuotaStatus = () => {
  // Fetch quota tracking data - refresh every 30 seconds
  const { data: quotaData, isLoading: quotaLoading } = useQuery({
    queryKey: ["api-quota-tracking"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("api_quota_tracking")
        .select("*")
        .eq("api_name", "youtube")
        .single();

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch latest fetch log
  const { data: latestFetch, isLoading: fetchLoading } = useQuery({
    queryKey: ["latest-fetch-log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_fetch_logs")
        .select("*")
        .order("fetch_time", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    refetchInterval: 30000,
  });

  if (quotaLoading || fetchLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>YouTube API Quota Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const quotaLimit = 10000;
  const quotaRemaining = quotaData?.quota_remaining || 0;
  const quotaUsed = quotaLimit - quotaRemaining;
  const quotaPercentage = (quotaRemaining / quotaLimit) * 100;
  const lastFetchCost = latestFetch
    ? (latestFetch.quota_remaining || 0) - quotaRemaining
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          YouTube API Quota Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quota Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Quota Remaining</span>
            <span className="font-semibold">
              {quotaRemaining.toLocaleString()} / {quotaLimit.toLocaleString()} units
            </span>
          </div>
          <Progress value={quotaPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {quotaPercentage.toFixed(1)}% remaining
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Quota Used Today */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm">Used Today</span>
            </div>
            <p className="text-2xl font-bold">{quotaUsed.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">
              {((quotaUsed / quotaLimit) * 100).toFixed(1)}% of daily limit
            </p>
          </div>

          {/* Quota Reset Time */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4" />
              <span className="text-sm">Resets In</span>
            </div>
            <p className="text-2xl font-bold">
              {quotaData?.quota_reset_at
                ? formatDistanceToNow(new Date(quotaData.quota_reset_at))
                : "Unknown"}
            </p>
            <p className="text-xs text-muted-foreground">
              {quotaData?.quota_reset_at
                ? new Date(quotaData.quota_reset_at).toLocaleString()
                : "N/A"}
            </p>
          </div>

          {/* Last Fetch Time */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Last Fetch</span>
            </div>
            <p className="text-2xl font-bold">
              {latestFetch?.fetch_time
                ? formatDistanceToNow(new Date(latestFetch.fetch_time), {
                    addSuffix: true,
                  })
                : "Never"}
            </p>
            <p className="text-xs text-muted-foreground">
              {latestFetch?.channels_processed || 0} channels,{" "}
              {latestFetch?.videos_found || 0} videos found
            </p>
          </div>

          {/* Last Fetch Cost */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span className="text-sm">Last Fetch Cost</span>
            </div>
            <p className="text-2xl font-bold">
              {Math.abs(lastFetchCost).toLocaleString()} units
            </p>
            <p className="text-xs text-muted-foreground">
              {latestFetch?.fetch_time
                ? new Date(latestFetch.fetch_time).toLocaleString()
                : "N/A"}
            </p>
          </div>
        </div>

        {/* Last Update Time */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Last updated:{" "}
            {quotaData?.updated_at
              ? formatDistanceToNow(new Date(quotaData.updated_at), {
                  addSuffix: true,
                })
              : "Unknown"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
