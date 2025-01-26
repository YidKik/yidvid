import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Clock, Eye, Calendar } from "lucide-react";

export const UserAnalyticsSection = () => {
  const { data: analytics } = useQuery({
    queryKey: ["user-analytics"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      // Fetch analytics data
      const { data: sessions } = await supabase
        .from("user_analytics")
        .select("*")
        .eq("user_id", session.user.id);

      if (!sessions) return null;

      // Calculate metrics
      const totalSessions = sessions.length;
      const totalTimeSpent = sessions.reduce((total, session) => {
        if (!session.session_end) return total;
        const start = new Date(session.session_start);
        const end = new Date(session.session_end);
        return total + (end.getTime() - start.getTime());
      }, 0);

      // Get unique pages viewed (excluding duplicates)
      const uniquePagesViewed = new Set(sessions.map(s => s.page_path)).size;

      return {
        totalSessions,
        totalTimeSpent,
        uniquePagesViewed,
      };
    },
  });

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} days`;
    if (hours > 0) return `${hours} hours`;
    if (minutes > 0) return `${minutes} minutes`;
    return `${seconds} seconds`;
  };

  if (!analytics) return null;

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold mb-4">Your Viewing Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 flex flex-col items-center text-center">
          <Clock className="h-8 w-8 mb-2" />
          <h3 className="text-lg font-medium">Total Time Spent</h3>
          <p className="text-2xl font-bold mt-2">
            {formatTime(analytics.totalTimeSpent)}
          </p>
        </Card>

        <Card className="p-6 flex flex-col items-center text-center">
          <Eye className="h-8 w-8 mb-2" />
          <h3 className="text-lg font-medium">Pages Viewed</h3>
          <p className="text-2xl font-bold mt-2">
            {analytics.uniquePagesViewed}
          </p>
        </Card>

        <Card className="p-6 flex flex-col items-center text-center">
          <Calendar className="h-8 w-8 mb-2" />
          <h3 className="text-lg font-medium">Total Sessions</h3>
          <p className="text-2xl font-bold mt-2">
            {analytics.totalSessions}
          </p>
        </Card>
      </div>
    </section>
  );
};