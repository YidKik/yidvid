import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { VideoHistorySection } from "@/components/history/VideoHistorySection";
import { 
  BarChart3, History, Eye, Clock, Users, TrendingUp, Calendar, 
  Flame, Play, Loader2 
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export const SettingsActivity = () => {
  const { isMobile } = useIsMobile();
  const { isAuthenticated, user, isLoading: authLoading } = useUnifiedAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["user-analytics-stats", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: historyData } = await supabase
        .from("video_history")
        .select("id, watched_at, video_id")
        .eq("user_id", user.id)
        .order("watched_at", { ascending: true });

      const { data: channelData } = await supabase
        .from("video_history")
        .select(`youtube_videos!inner (channel_id)`)
        .eq("user_id", user.id);

      const { count: subscriptionCount } = await supabase
        .from("channel_subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      const totalVideosWatched = historyData?.length || 0;
      const uniqueChannels = new Set(
        channelData?.map((item: any) => item.youtube_videos?.channel_id).filter(Boolean)
      ).size;

      const avgVideoMinutes = 4;
      const totalMinutes = totalVideosWatched * avgVideoMinutes;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      const today = new Date(); today.setHours(0, 0, 0, 0);
      const todayWatched = historyData?.filter(i => new Date(i.watched_at) >= today).length || 0;

      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      const weekWatched = historyData?.filter(i => new Date(i.watched_at) >= weekAgo).length || 0;

      let currentStreak = 0;
      if (historyData && historyData.length > 0) {
        const watchDays = new Set(
          historyData.map(i => {
            const d = new Date(i.watched_at);
            return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
          })
        );
        const checkDate = new Date(); checkDate.setHours(0, 0, 0, 0);
        while (watchDays.has(`${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }
      }

      return {
        totalVideosWatched, uniqueChannels,
        subscriptionCount: subscriptionCount || 0,
        watchTime: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
        totalMinutes, todayWatched, weekWatched, currentStreak,
      };
    },
    enabled: isAuthenticated && !!user?.id && !authLoading,
    staleTime: 60000,
  });

  const statItems = [
    { icon: Eye, label: "Videos Watched", value: stats?.totalVideosWatched ?? 0, accent: "#FF0000" },
    { icon: Clock, label: "Watch Time", value: stats?.watchTime ?? "0m", accent: "#FFCC00" },
    { icon: Users, label: "Channels", value: stats?.uniqueChannels ?? 0, accent: "#FF0000" },
    { icon: TrendingUp, label: "Today", value: stats?.todayWatched ?? 0, accent: "#FFCC00" },
    { icon: Calendar, label: "This Week", value: stats?.weekWatched ?? 0, accent: "#FF0000" },
    { icon: Flame, label: "Streak", value: `${stats?.currentStreak ?? 0}d`, accent: "#FFCC00" },
  ];

  return (
    <div>
      {/* Stats Header */}
      <div className="flex items-center gap-2 mb-5">
        <BarChart3 className="h-5 w-5 text-[#FF0000]" />
        <h3 className="text-base font-bold text-[#1A1A1A] dark:text-[#e8e8e8]">Your Stats</h3>
      </div>

      {/* Stats Grid */}
      {authLoading || isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-[#999]" />
        </div>
      ) : !isAuthenticated ? (
        <div className="py-10 text-center rounded-xl border border-[#E5E5E5] dark:border-[#333] bg-[#F9F9F9] dark:bg-[#0f0f0f]">
          <Play className="h-8 w-8 text-[#ccc] mx-auto mb-2" />
          <p className="text-sm font-medium text-[#666] dark:text-[#aaa]">Sign in to see your stats</p>
        </div>
      ) : (
        <div className={cn(
          "grid gap-3 mb-8",
          isMobile ? "grid-cols-2" : "grid-cols-3"
        )}>
          {statItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-[#E5E5E5] dark:border-[#333] bg-[#F9F9F9] dark:bg-[#0f0f0f]"
            >
              <div
                className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
                style={{ backgroundColor: `${item.accent}15` }}
              >
                <item.icon className="h-4 w-4" style={{ color: item.accent }} />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-[#1A1A1A] dark:text-[#e8e8e8] leading-tight">
                  {item.value}
                </p>
                <p className="text-xs text-[#999] font-medium truncate">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Watch History */}
      <div className="border-t border-[#E5E5E5] dark:border-[#333] pt-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-[#FF0000]" />
          <h3 className="text-base font-bold text-[#1A1A1A] dark:text-[#e8e8e8]">Watch History</h3>
        </div>
        <VideoHistorySection />
      </div>
    </div>
  );
};
