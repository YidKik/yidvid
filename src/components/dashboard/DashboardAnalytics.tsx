import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Clock } from "lucide-react";

export const DashboardAnalytics = () => {
  const { data: totalStats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data: channels, error: channelsError } = await supabase
        .from("youtube_channels")
        .select("channel_id", { count: "exact" });

      const { data: interactions, error: interactionsError } = await supabase
        .from("user_video_interactions")
        .select("*")
        .eq('interaction_type', 'view');

      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("id", { count: "exact" });

      const { data: sessions, error: sessionsError } = await supabase
        .from("user_analytics")
        .select("session_start, session_end");

      if (channelsError || interactionsError || usersError || sessionsError) 
        throw channelsError || interactionsError || usersError || sessionsError;

      // Calculate total watch time in hours
      const totalHours = sessions?.reduce((sum, session) => {
        if (!session.session_end) return sum;
        const duration = new Date(session.session_end).getTime() - new Date(session.session_start).getTime();
        return sum + (duration / (1000 * 60 * 60)); // Convert ms to hours
      }, 0);

      // Calculate most popular hour
      const hourCounts: { [key: number]: number } = {};
      sessions?.forEach(session => {
        const hour = new Date(session.session_start).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      const mostPopularHour = Object.entries(hourCounts).reduce(
        (max, [hour, count]) => (count > max.count ? { hour: Number(hour), count } : max),
        { hour: 0, count: 0 }
      );

      return {
        totalChannels: channels?.length || 0,
        totalVideos: interactions?.length || 0,
        totalViews: interactions?.length || 0,
        totalUsers: users?.length || 0,
        totalHours: Math.round(totalHours || 0),
        mostPopularHour: mostPopularHour.hour,
      };
    },
  });

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:00 ${period}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
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
        <CardHeader>
          <CardTitle>Total Users</CardTitle>
          <CardDescription>Registered accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{totalStats?.totalUsers}</p>
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

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Peak Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-2xl font-bold">
              {totalStats?.mostPopularHour !== undefined ? formatHour(totalStats.mostPopularHour) : '-'}
            </p>
            <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full transition-all" 
                style={{ 
                  width: totalStats?.mostPopularHour !== undefined ? 
                    `${(totalStats.mostPopularHour / 24) * 100}%` : '0%' 
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Most active hour of the day
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};