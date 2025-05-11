
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { startOfWeek, startOfMonth } from "date-fns";

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

        // Get total channels count
        const { count: totalChannels, error: channelsError } = await supabase
          .from("youtube_channels")
          .select("*", { count: "exact", head: true });

        if (channelsError) throw channelsError;

        // Get total videos count
        const { count: totalVideos, error: videosError } = await supabase
          .from("youtube_videos")
          .select("*", { count: "exact", head: true });

        if (videosError) throw videosError;

        // Get total views count
        const { count: totalViews, error: viewsError } = await supabase
          .from("user_video_interactions")
          .select("*", { count: "exact", head: true })
          .eq('interaction_type', 'view');

        if (viewsError) throw viewsError;

        // Get total users count directly
        const { count: totalUsers, error: usersError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        if (usersError) throw usersError;

        // Get analytics data for sessions
        const { data: sessions, error: sessionsError } = await supabase
          .from("user_analytics")
          .select("session_start, session_end");

        if (sessionsError) {
          console.error('Error fetching sessions:', sessionsError);
          throw sessionsError;
        }

        // Calculate total watch time in hours
        const totalHours = (sessions || []).reduce((sum, session) => {
          if (!session.session_end || !session.session_start) return sum;
          
          const start = new Date(session.session_start);
          const end = new Date(session.session_end);
          
          const durationInHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          
          if (durationInHours > 0 && durationInHours < 24) {
            return sum + durationInHours;
          }
          return sum;
        }, 0);

        // Get anonymous sessions count
        const { count: anonymousUsers, error: anonSessionsError } = await supabase
          .from("user_analytics")
          .select("*", { count: "exact", head: true })
          .is('user_id', null);

        if (anonSessionsError) throw anonSessionsError;

        // Calculate most popular hour
        const hourCounts: { [key: number]: number } = {};
        (sessions || []).forEach(session => {
          const hour = new Date(session.session_start).getHours();
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });

        const mostPopularHour = Object.entries(hourCounts).reduce(
          (max, [hour, count]) => (count > max.count ? { hour: Number(hour), count } : max),
          { hour: 0, count: 0 }
        );

        // Get currently active users (sessions without an end time)
        const { count: activeUsers, error: activeUsersError } = await supabase
          .from("user_analytics")
          .select("*", { count: "exact", head: true })
          .is("session_end", null);

        if (activeUsersError) throw activeUsersError;

        // Calculate date ranges for weekly and monthly metrics
        const now = new Date();
        const weekStart = startOfWeek(now);
        const monthStart = startOfMonth(now);

        // Fetch user analytics for the month
        const { data: recentSessions, error: recentError } = await supabase
          .from("user_analytics")
          .select("user_id, session_start")
          .gte("session_start", monthStart.toISOString())
          .not('user_id', 'is', null);

        if (recentError) {
          console.error('Error fetching recent sessions:', recentError);
          throw recentError;
        }

        // Count unique users by time period
        const weeklyUserIds = new Set();
        const monthlyUserIds = new Set();

        (recentSessions || []).forEach(session => {
          const sessionDate = new Date(session.session_start);
          
          if (session.user_id) {
            // All sessions are already filtered to be within the current month
            monthlyUserIds.add(session.user_id);
            
            // Check if in current week
            if (sessionDate >= weekStart) {
              weeklyUserIds.add(session.user_id);
            }
          }
        });

        return {
          totalChannels: totalChannels || 0,
          totalVideos: totalVideos || 0,
          totalViews: totalViews || 0,
          totalUsers: totalUsers || 0,
          totalHours: Math.round(totalHours * 100) / 100,
          mostPopularHour: mostPopularHour.hour,
          anonymousUsers: anonymousUsers || 0,
          activeUsers: activeUsers || 0,
          weeklyUsers: weeklyUserIds.size,
          monthlyUsers: monthlyUserIds.size
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
