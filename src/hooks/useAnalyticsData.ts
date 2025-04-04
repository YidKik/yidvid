
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
}

export const useAnalyticsData = (userId: string | undefined) => {
  const { data: totalStats, isLoading } = useQuery({
    queryKey: ["dashboard-stats", userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error("No authenticated user");
      }

      try {
        // Check if user is admin first
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", userId)
          .single();

        if (profileError) throw profileError;
        if (!profile?.is_admin) throw new Error("Unauthorized access");

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

        // Get total users count
        const { count: totalUsers, error: usersError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        if (usersError) throw usersError;

        // Get session data for watch time calculation
        const { data: sessions, error: sessionsError } = await supabase
          .from("user_analytics")
          .select("session_start, session_end")
          .not('session_end', 'is', null);

        if (sessionsError) {
          console.error('Error fetching sessions:', sessionsError);
          throw sessionsError;
        }

        // Calculate total watch time in hours with proper conversion
        const totalHours = (sessions as Session[] || []).reduce((sum, session) => {
          if (!session.session_end || !session.session_start) return sum;
          
          const start = new Date(session.session_start);
          const end = new Date(session.session_end);
          
          // Calculate duration in milliseconds and convert to hours
          const durationInHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          
          // Only add if duration is positive and less than 24 hours (to filter out potentially invalid sessions)
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
        (sessions as Session[] || []).forEach(session => {
          const hour = new Date(session.session_start).getHours();
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });

        const mostPopularHour = Object.entries(hourCounts).reduce(
          (max, [hour, count]) => (count > max.count ? { hour: Number(hour), count } : max),
          { hour: 0, count: 0 }
        );

        return {
          totalChannels: totalChannels || 0,
          totalVideos: totalVideos || 0,
          totalViews: totalViews || 0,
          totalUsers: totalUsers || 0,
          totalHours: Math.round(totalHours * 100) / 100,
          mostPopularHour: mostPopularHour.hour,
          anonymousUsers: anonymousUsers || 0,
        };
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast.error(error.message || 'Failed to fetch dashboard statistics');
        throw error;
      }
    },
    enabled: !!userId,
    retry: 2,
    retryDelay: 1000,
  });

  return { totalStats, isLoading };
};
