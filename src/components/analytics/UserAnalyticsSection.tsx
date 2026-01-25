
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Clock, Eye, Users, Play, TrendingUp, Calendar } from "lucide-react";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { Skeleton } from "@/components/ui/skeleton";

export const UserAnalyticsSection = () => {
  const { isAuthenticated, user, isLoading: authLoading } = useUnifiedAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["user-analytics-stats", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get all video history entries with video details
      const { data: historyData, error: historyError } = await supabase
        .from("video_history")
        .select("id, watched_at, video_id")
        .eq("user_id", user.id)
        .order("watched_at", { ascending: true });

      if (historyError) {
        console.error("Error fetching history stats:", historyError);
      }

      // Get unique channels from watched videos
      const { data: channelData, error: channelError } = await supabase
        .from("video_history")
        .select(`
          youtube_videos!inner (
            channel_id
          )
        `)
        .eq("user_id", user.id);

      if (channelError) {
        console.error("Error fetching channel stats:", channelError);
      }

      // Get subscriptions count
      const { count: subscriptionCount, error: subError } = await supabase
        .from("channel_subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (subError) {
        console.error("Error fetching subscription count:", subError);
      }

      // Calculate accurate stats
      const totalVideosWatched = historyData?.length || 0;
      const uniqueChannels = new Set(
        channelData?.map((item: any) => item.youtube_videos?.channel_id).filter(Boolean)
      ).size;

      // Calculate watch time based on session analysis
      // Group watches by day and estimate ~4 minutes per video (average YouTube video length)
      const avgVideoMinutes = 4;
      const totalMinutes = totalVideosWatched * avgVideoMinutes;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      // Get today's watch count
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayWatched = historyData?.filter(
        (item) => new Date(item.watched_at) >= today
      ).length || 0;

      // Get this week's watch count
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekWatched = historyData?.filter(
        (item) => new Date(item.watched_at) >= weekAgo
      ).length || 0;

      // Get this month's watch count
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      const monthWatched = historyData?.filter(
        (item) => new Date(item.watched_at) >= monthAgo
      ).length || 0;

      // Calculate streak (consecutive days of watching)
      let currentStreak = 0;
      if (historyData && historyData.length > 0) {
        const watchDays = new Set(
          historyData.map((item) => {
            const date = new Date(item.watched_at);
            return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
          })
        );
        
        const checkDate = new Date();
        checkDate.setHours(0, 0, 0, 0);
        
        while (true) {
          const dateKey = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
          if (watchDays.has(dateKey)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }

      return {
        totalVideosWatched,
        uniqueChannels,
        subscriptionCount: subscriptionCount || 0,
        watchTimeFormatted: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
        totalMinutes,
        todayWatched,
        weekWatched,
        monthWatched,
        currentStreak,
      };
    },
    enabled: isAuthenticated && !!user?.id && !authLoading,
    staleTime: 60000,
  });

  if (authLoading || isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array(6).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-gray-100 rounded-xl text-center">
        <Play className="h-10 w-10 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">Sign in to see your viewing stats</p>
        <p className="text-sm text-gray-500 mt-1">Track your watch history and activity</p>
      </div>
    );
  }

  const statCards = [
    {
      icon: Eye,
      label: "Total Videos",
      value: stats?.totalVideosWatched || 0,
      subtext: "Videos watched",
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
    },
    {
      icon: Clock,
      label: "Watch Time",
      value: stats?.watchTimeFormatted || "0m",
      subtext: `~${stats?.totalMinutes || 0} mins total`,
      color: "bg-green-500",
      lightColor: "bg-green-50",
    },
    {
      icon: Users,
      label: "Channels",
      value: stats?.uniqueChannels || 0,
      subtext: `${stats?.subscriptionCount || 0} subscribed`,
      color: "bg-purple-500",
      lightColor: "bg-purple-50",
    },
    {
      icon: TrendingUp,
      label: "Today",
      value: stats?.todayWatched || 0,
      subtext: "Videos today",
      color: "bg-orange-500",
      lightColor: "bg-orange-50",
    },
    {
      icon: Calendar,
      label: "This Week",
      value: stats?.weekWatched || 0,
      subtext: `${stats?.monthWatched || 0} this month`,
      color: "bg-pink-500",
      lightColor: "bg-pink-50",
    },
    {
      icon: TrendingUp,
      label: "Streak",
      value: stats?.currentStreak || 0,
      subtext: stats?.currentStreak === 1 ? "day" : "days in a row",
      color: "bg-yellow-500",
      lightColor: "bg-yellow-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {statCards.map((stat) => (
        <Card 
          key={stat.label} 
          className={`p-4 ${stat.lightColor} border-0 shadow-sm hover:shadow-md transition-shadow`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className={`p-2 rounded-lg ${stat.color}`}>
              <stat.icon className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          <p className="text-xs font-medium text-gray-700 mt-0.5">{stat.label}</p>
          <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
        </Card>
      ))}
    </div>
  );
};
