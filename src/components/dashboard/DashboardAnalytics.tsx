
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { AnalyticsLoading } from "./analytics/AnalyticsLoading";
import { AnalyticsGrid } from "./analytics/AnalyticsGrid";
import { UserStatsCards } from "./analytics/UserStatsCards";
import { AuthRequiredMessage } from "./analytics/AuthRequiredMessage";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { GoogleAnalyticsOverview } from "@/components/admin/analytics/GoogleAnalyticsOverview";
import { TrafficSourcesChart } from "@/components/admin/analytics/TrafficSourcesChart";
import { TopPagesTable } from "@/components/admin/analytics/TopPagesTable";
import { DeviceBreakdown } from "@/components/admin/analytics/DeviceBreakdown";

export const DashboardAnalytics = () => {
  const [session, setSession] = useState(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { totalStats, isLoading } = useAnalyticsData(session?.user?.id);

  // When loading is done but no stats are available
  useEffect(() => {
    if (!isLoading && !totalStats) {
      setError("Failed to load analytics data. Please check your admin permissions.");
    } else if (totalStats) {
      setError(null);
    }
  }, [isLoading, totalStats]);

  if (!session?.user?.id) {
    return <AuthRequiredMessage />;
  }

  if (error) {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-semibold mb-4">Analytics Dashboard</h2>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold mb-4">Google Analytics - Site Traffic</h2>
      <GoogleAnalyticsOverview />
      
      <div className="grid gap-6 md:grid-cols-2 mt-8">
        <TrafficSourcesChart />
        <DeviceBreakdown />
      </div>
      
      <div className="mt-8">
        <TopPagesTable />
      </div>
      
      <h2 className="text-2xl font-semibold mt-12 mb-4">User Activity</h2>
      {isLoading ? (
        <div className="w-full p-4 bg-gray-50 rounded-lg">
          <p className="text-center text-gray-500">Loading user statistics...</p>
        </div>
      ) : (
        <UserStatsCards stats={totalStats} isLoading={isLoading} />
      )}
      
      <h2 className="text-2xl font-semibold my-6">General Statistics</h2>
      {isLoading ? <AnalyticsLoading /> : <AnalyticsGrid stats={totalStats} />}
    </div>
  );
};
