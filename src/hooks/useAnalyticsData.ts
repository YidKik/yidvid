
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Session {
  session_start: string;
  session_end: string | null;
}

export interface AnalyticsStats {
  totalChannels: number;
  totalVideos: number;
  totalViews: number;
  totalUsers: number;
  totalHours: number;
  mostPopularHour: number;
  anonymousUsers: number;
  activeUsers: number;
  weeklyUsers: number;
  monthlyUsers: number;
  avgEngagementTime: number;
  totalSessions: number;
  engagementRate: number;
  totalPageViews: number;
}

export const useAnalyticsData = (userId: string | undefined) => {
  const { data: totalStats, isLoading } = useQuery({
    queryKey: ["dashboard-stats", userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error("No authenticated user");
      }

      try {
        // First check for pin bypass which allows local admin access
        const hasPinBypass = localStorage.getItem('admin-pin-bypass') === 'true';
        if (hasPinBypass) {
          console.log("Using PIN bypass for admin access");
        } else {
          // Check if user is admin using direct function call
          const { data: isAdmin, error: adminCheckError } = await supabase.functions.invoke('check-admin-status', {
            body: { userId },
          });
          
          if (adminCheckError || !isAdmin?.isAdmin) {
            console.error('Admin check error:', adminCheckError);
            throw new Error("Unauthorized access - you must be an admin to view analytics");
          }
        }

        const last7DaysTimestamp = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const last30DaysIso = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        const [
          { count: totalChannels, error: channelsError },
          { count: totalVideos, error: videosError },
          { count: totalViews, error: viewsError },
          { count: internalTotalUsers, error: usersError },
          { count: anonymousUsers, error: anonSessionsError },
          { count: internalActiveUsers, error: activeUsersError },
          { data: sessions, error: sessionsError },
          { data: recentSessions, error: recentError },
          { data: allTimeGA, error: allTimeGAError },
          { data: weeklyGA, error: weeklyGAError },
          { data: monthlyGA, error: monthlyGAError },
          { data: realtimeGA, error: realtimeGAError },
        ] = await Promise.all([
          supabase.from("youtube_channels").select("*", { count: "exact", head: true }).is("deleted_at", null),
          supabase.from("youtube_videos").select("*", { count: "exact", head: true }).is("deleted_at", null),
          supabase.from("user_video_interactions").select("*", { count: "exact", head: true }).eq("interaction_type", "view"),
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("user_analytics").select("*", { count: "exact", head: true }).is("user_id", null),
          supabase.from("user_analytics").select("*", { count: "exact", head: true }).is("session_end", null),
          supabase.from("user_analytics").select("session_start, session_end"),
          supabase.from("user_analytics").select("user_id, session_start").gte("session_start", last30DaysIso).not("user_id", "is", null),
          supabase.functions.invoke("fetch-ga-analytics", { body: { metricType: "overview", dateRange: "allTime" } }),
          supabase.functions.invoke("fetch-ga-analytics", { body: { metricType: "overview", dateRange: "7daysAgo" } }),
          supabase.functions.invoke("fetch-ga-analytics", { body: { metricType: "overview", dateRange: "30daysAgo" } }),
          supabase.functions.invoke("fetch-ga-analytics", { body: { metricType: "realtime" } }),
        ]);

        if (channelsError) throw channelsError;
        if (videosError) throw videosError;
        if (viewsError) throw viewsError;
        if (usersError) throw usersError;
        if (anonSessionsError) throw anonSessionsError;
        if (activeUsersError) throw activeUsersError;
        if (sessionsError) {
          console.error("Error fetching sessions:", sessionsError);
          throw sessionsError;
        }
        if (recentError) {
          console.error("Error fetching recent sessions:", recentError);
          throw recentError;
        }

        const totalHoursFromSessions = (sessions || []).reduce((sum, session) => {
          if (!session.session_end || !session.session_start) return sum;

          const start = new Date(session.session_start);
          const end = new Date(session.session_end);
          const durationInHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

          if (durationInHours > 0 && durationInHours < 24) {
            return sum + durationInHours;
          }

          return sum;
        }, 0);

        const hourCounts: { [key: number]: number } = {};
        (sessions || []).forEach((session) => {
          const hour = new Date(session.session_start).getHours();
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });

        const mostPopularHour = Object.entries(hourCounts).reduce(
          (max, [hour, count]) => (count > max.count ? { hour: Number(hour), count } : max),
          { hour: 0, count: 0 }
        );

        const weeklyUserIds = new Set<string>();
        const monthlyUserIds = new Set<string>();
        (recentSessions || []).forEach((session) => {
          if (!session.user_id) return;

          monthlyUserIds.add(session.user_id);
          if (new Date(session.session_start).getTime() >= last7DaysTimestamp) {
            weeklyUserIds.add(session.user_id);
          }
        });

        const getMetricValue = (report: any, metricIndex: number) => {
          const value = report?.rows?.[0]?.metricValues?.[metricIndex]?.value ?? "0";
          const parsed = parseFloat(value);
          return Number.isFinite(parsed) ? parsed : 0;
        };

        if (allTimeGAError || weeklyGAError || monthlyGAError || realtimeGAError) {
          console.error("Google Analytics fallback triggered", {
            allTimeGAError,
            weeklyGAError,
            monthlyGAError,
            realtimeGAError,
          });
        }

        const totalUsers = allTimeGAError
          ? internalTotalUsers || 0
          : Math.round(getMetricValue(allTimeGA, 4));
        const totalHours = allTimeGAError
          ? Math.round(totalHoursFromSessions * 10) / 10
          : Math.round((getMetricValue(allTimeGA, 5) / 3600) * 10) / 10;
        const activeUsers = realtimeGAError
          ? internalActiveUsers || 0
          : Math.round(getMetricValue(realtimeGA, 0));
        const weeklyUsers = weeklyGAError
          ? weeklyUserIds.size
          : Math.round(getMetricValue(weeklyGA, 4));
        const monthlyUsers = monthlyGAError
          ? monthlyUserIds.size
          : Math.round(getMetricValue(monthlyGA, 4));

        const totalSessions = allTimeGAError
          ? 0
          : Math.round(getMetricValue(allTimeGA, 1));
        const engagementRate = allTimeGAError
          ? 0
          : Math.round(getMetricValue(allTimeGA, 3) * 1000) / 10;
        const totalPageViews = allTimeGAError
          ? 0
          : Math.round(getMetricValue(allTimeGA, 2));
        const avgEngagementTime = allTimeGAError || !totalUsers
          ? 0
          : Math.round((getMetricValue(allTimeGA, 5) / totalUsers) / 60 * 10) / 10;

        return {
          totalChannels: totalChannels || 0,
          totalVideos: totalVideos || 0,
          totalViews: totalViews || 0,
          totalUsers,
          totalHours,
          mostPopularHour: mostPopularHour.hour,
          anonymousUsers: anonymousUsers || 0,
          activeUsers,
          weeklyUsers,
          monthlyUsers,
          avgEngagementTime,
          totalSessions,
          engagementRate,
          totalPageViews,
        };
      } catch (error: any) {
        console.error('Error fetching dashboard stats:', error);
        toast.error(error.message || 'Failed to fetch dashboard statistics');
        throw error;
      }
    },
    enabled: !!userId,
    retry: 2,
    retryDelay: 1000,
    refetchInterval: 60000, // Refetch every minute to keep active user count updated
  });

  return { totalStats, isLoading };
};
