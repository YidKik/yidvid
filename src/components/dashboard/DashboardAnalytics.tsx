import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Clock, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Session {
  session_start: string;
  session_end: string | null;
}

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

  const { data: totalStats, isLoading } = useQuery({
    queryKey: ["dashboard-stats", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        throw new Error("No authenticated user");
      }

      try {
        // Check if user is admin first
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", session.user.id)
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
    enabled: !!session?.user?.id,
    retry: 2,
    retryDelay: 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please sign in to view analytics</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Total Channels</CardTitle>
          <CardDescription>Number of tracked channels</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{totalStats?.totalChannels}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Total Videos</CardTitle>
          <CardDescription>Across all channels</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{totalStats?.totalVideos}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Total Views</CardTitle>
          <CardDescription>Total video views on website</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            {totalStats?.totalViews.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>Registered accounts</CardDescription>
          </div>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{totalStats?.totalUsers}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Anonymous Users</CardTitle>
            <CardDescription>Visitors without accounts</CardDescription>
          </div>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{totalStats?.anonymousUsers}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Watch Time</CardTitle>
          <CardDescription>Hours spent on website</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{totalStats?.totalHours}</p>
        </CardContent>
      </Card>
    </div>
  );
};