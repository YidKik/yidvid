import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, TrendingDown, RefreshCw, Activity, AlertTriangle, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export const ApiQuotaStatus = () => {
  const previousPercentageRef = useRef<number | null>(null);
  
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

  // Determine alert level based on quota percentage
  const getAlertLevel = () => {
    if (quotaPercentage <= 5) return { level: "critical", color: "destructive" };
    if (quotaPercentage <= 10) return { level: "high", color: "destructive" };
    if (quotaPercentage <= 20) return { level: "warning", color: "warning" };
    return { level: "normal", color: "default" };
  };

  const alertLevel = getAlertLevel();
  const showAlert = quotaPercentage <= 20;

  // Toast notification when crossing thresholds
  useEffect(() => {
    if (quotaData && previousPercentageRef.current !== null) {
      const previous = previousPercentageRef.current;
      
      // Check if we crossed the 20% threshold (going down)
      if (previous > 20 && quotaPercentage <= 20 && quotaPercentage > 10) {
        toast.warning("Quota Warning", {
          description: `API quota is at ${quotaPercentage.toFixed(1)}%. Monitor usage carefully.`,
          duration: 10000,
        });
      }
      
      // Check if we crossed the 10% threshold (going down)
      if (previous > 10 && quotaPercentage <= 10 && quotaPercentage > 5) {
        toast.error("High Alert: Quota Running Low", {
          description: `Only ${quotaPercentage.toFixed(1)}% remaining. Consider limiting manual fetches.`,
          duration: 15000,
        });
      }
      
      // Check if we crossed the 5% threshold (going down)
      if (previous > 5 && quotaPercentage <= 5) {
        toast.error("CRITICAL: Quota Almost Exhausted!", {
          description: `Only ${quotaPercentage.toFixed(1)}% remaining. Automatic fetching may fail!`,
          duration: 20000,
        });
      }
    }
    
    previousPercentageRef.current = quotaPercentage;
  }, [quotaPercentage, quotaData]);

  return (
    <Card className={showAlert ? "border-2 border-destructive" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            YouTube API Quota Status
          </div>
          {showAlert && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              alertLevel.level === "critical" 
                ? "bg-destructive text-destructive-foreground" 
                : alertLevel.level === "high"
                ? "bg-orange-500 text-white"
                : "bg-yellow-500 text-yellow-950"
            }`}>
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-semibold uppercase">
                {alertLevel.level === "critical" ? "CRITICAL" : alertLevel.level === "high" ? "HIGH ALERT" : "WARNING"}
              </span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Critical Alert Banner */}
        {showAlert && (
          <Alert variant={alertLevel.color === "destructive" ? "destructive" : "default"} 
                 className={alertLevel.color === "warning" ? "border-yellow-500 bg-yellow-50" : ""}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-bold">
              {alertLevel.level === "critical" && "CRITICAL: Quota Almost Exhausted!"}
              {alertLevel.level === "high" && "HIGH ALERT: Quota Running Very Low"}
              {alertLevel.level === "warning" && "Warning: Quota Running Low"}
            </AlertTitle>
            <AlertDescription>
              {alertLevel.level === "critical" && (
                <>Only <strong>{quotaRemaining.toLocaleString()} units ({quotaPercentage.toFixed(1)}%)</strong> remaining. 
                Automatic fetching may fail. Quota resets {quotaData?.quota_reset_at && formatDistanceToNow(new Date(quotaData.quota_reset_at), { addSuffix: true })}.</>
              )}
              {alertLevel.level === "high" && (
                <>Only <strong>{quotaRemaining.toLocaleString()} units ({quotaPercentage.toFixed(1)}%)</strong> remaining. 
                Consider limiting manual fetches until reset {quotaData?.quota_reset_at && formatDistanceToNow(new Date(quotaData.quota_reset_at), { addSuffix: true })}.</>
              )}
              {alertLevel.level === "warning" && (
                <><strong>{quotaRemaining.toLocaleString()} units ({quotaPercentage.toFixed(1)}%)</strong> remaining. 
                Monitor usage carefully. Resets {quotaData?.quota_reset_at && formatDistanceToNow(new Date(quotaData.quota_reset_at), { addSuffix: true })}.</>
              )}
            </AlertDescription>
          </Alert>
        )}
        {/* Quota Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Quota Remaining</span>
            <span className={`font-semibold ${
              quotaPercentage <= 5 ? "text-destructive" :
              quotaPercentage <= 10 ? "text-orange-600" :
              quotaPercentage <= 20 ? "text-yellow-600" :
              ""
            }`}>
              {quotaRemaining.toLocaleString()} / {quotaLimit.toLocaleString()} units
            </span>
          </div>
          <Progress 
            value={quotaPercentage} 
            className={`h-3 ${
              quotaPercentage <= 5 ? "[&>div]:bg-destructive" :
              quotaPercentage <= 10 ? "[&>div]:bg-orange-500" :
              quotaPercentage <= 20 ? "[&>div]:bg-yellow-500" :
              ""
            }`} 
          />
          <p className={`text-xs font-medium ${
            quotaPercentage <= 5 ? "text-destructive" :
            quotaPercentage <= 10 ? "text-orange-600" :
            quotaPercentage <= 20 ? "text-yellow-600" :
            "text-muted-foreground"
          }`}>
            {quotaPercentage.toFixed(1)}% remaining
            {quotaPercentage <= 20 && " ⚠️"}
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
