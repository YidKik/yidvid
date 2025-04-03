
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { AnalyticsLoading } from "./analytics/AnalyticsLoading";
import { AnalyticsGrid } from "./analytics/AnalyticsGrid";
import { AuthRequiredMessage } from "./analytics/AuthRequiredMessage";

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

  if (isLoading) {
    return <AnalyticsLoading />;
  }

  if (!session?.user?.id) {
    return <AuthRequiredMessage />;
  }

  return <AnalyticsGrid stats={totalStats} />;
};
