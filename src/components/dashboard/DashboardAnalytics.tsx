
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { AnalyticsLoading } from "./analytics/AnalyticsLoading";
import { AnalyticsGrid } from "./analytics/AnalyticsGrid";
import { UserStatsCards } from "./analytics/UserStatsCards";
import { AuthRequiredMessage } from "./analytics/AuthRequiredMessage";
import { toast } from "sonner";

export const DashboardAnalytics = () => {
  const [session, setSession] = useState(null);

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
      toast.error("Failed to load analytics data. Please check your admin permissions.");
    }
  }, [isLoading, totalStats]);

  if (!session?.user?.id) {
    return <AuthRequiredMessage />;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold mb-4">User Activity</h2>
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
