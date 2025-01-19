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

        // Get total channels with error handling
        const { data: channels, error: channelsError } = await supabase
          .from("youtube_channels")
          .select("*", { count: "exact" });

        if (channelsError) throw channelsError;

        // Get total videos with error handling
        const { data: videos, error: videosError } = await supabase
          .from("youtube_videos")
          .select("*", { count: "exact" });

        if (videosError) throw videosError;

        // Get total views with error handling
        const { data: views, error: viewsError } = await supabase
          .from("user_video_interactions")
          .select("*", { count: "exact" })
          .eq('interaction_type', 'view');

        if (viewsError) throw viewsError;

        // Get total users with error handling
        const { data: users, error: usersError } = await supabase
          .from("profiles")
          .select("*", { count: "exact" });

        if (usersError) throw usersError;

        // Get session data for watch time calculation with error handling
        const { data: sessions, error: sessionsError } = await supabase
          .from("user_analytics")
          .select("session_start, session_end")
          .not('session_end', 'is', null);

        if (sessionsError) throw sessionsError;

        // Get anonymous sessions with error handling
        const { data: anonSessions, error: anonSessionsError } = await supabase
          .from("user_analytics")
          .select("*", { count: "exact" })
          .is('user_id', null);

        if (anonSessionsError) throw anonSessionsError;

        // Calculate total watch time in hours
        const totalHours = sessions?.reduce((sum, session) => {
          if (!session.session_end) return sum;
          const duration = new Date(session.session_end).getTime() - new Date(session.session_start).getTime();
          return sum + (duration / (1000 * 60 * 60));
        }, 0);

        // Calculate most popular hour
        const hourCounts: Record<number, number> = {};
        sessions?.forEach(session => {
          const hour = new Date(session.session_start).getHours();
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });

        const mostPopularHour = Object.entries(hourCounts).reduce(
          (max, [hour, count]) => (count > max.count ? { hour: Number(hour), count } : max),
          { hour: 0, count: 0 }
        );

        // Count unique anonymous users
        const uniqueAnonUsers = new Set(anonSessions?.map(session => 
          `${session.page_path}-${new Date(session.session_start).toDateString()}`
        )).size;

        return {
          totalChannels: channels?.length || 0,
          totalVideos: videos?.length || 0,
          totalViews: views?.length || 0,
          totalUsers: users?.length || 0,
          totalHours: Math.round(totalHours || 0),
          mostPopularHour: mostPopularHour.hour,
          anonymousUsers: uniqueAnonUsers || 0,
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