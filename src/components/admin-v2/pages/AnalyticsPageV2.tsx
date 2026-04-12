import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSessionManager } from "@/hooks/useSessionManager";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { subDays, format } from "date-fns";
import {
  Tv, Video, Eye, Users, Clock, Activity, UserCheck, CalendarDays,
  TrendingUp, Play, BarChart3, Loader2, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from "recharts";
...
export const AnalyticsPageV2 = () => {
  const { session } = useSessionManager();
  const userId = session?.user?.id;
  const [period, setPeriod] = useState<"7d" | "30d" | "all">("30d");
  const { totalStats: stats, isLoading: statsLoading } = useAnalyticsData(userId);

  // ── Daily session chart ───────────────────────────────────────────
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const { data: chartData = [] } = useQuery({
    queryKey: ["analytics-v2-chart", days],
    queryFn: async () => {
      const since = subDays(new Date(), days).toISOString();
      const { data } = await supabase
        .from("user_analytics")
        .select("session_start, user_id")
        .gte("session_start", since);

      const buckets: Record<string, { sessions: number; uniqueUsers: Set<string> }> = {};
      for (let i = 0; i < days; i++) {
        const d = format(subDays(new Date(), days - 1 - i), "MMM d");
        buckets[d] = { sessions: 0, uniqueUsers: new Set() };
      }

      (data || []).forEach((s) => {
        const d = format(new Date(s.session_start), "MMM d");
        if (buckets[d]) {
          buckets[d].sessions++;
          if (s.user_id) buckets[d].uniqueUsers.add(s.user_id);
        }
      });

      return Object.entries(buckets).map(([date, v]) => ({
        date,
        sessions: v.sessions,
        users: v.uniqueUsers.size,
      }));
    },
    enabled: !!userId,
  });

  // ── Top videos ────────────────────────────────────────────────────
  const { data: topVideos = [] } = useQuery({
    queryKey: ["analytics-v2-top-videos", period],
    queryFn: async () => {
      const since = period === "all" ? undefined : subDays(new Date(), days).toISOString();
      let q = supabase
        .from("user_video_interactions")
        .select("video_id")
        .eq("interaction_type", "view");
      if (since) q = q.gte("created_at", since);
      const { data } = await q;

      const counts: Record<string, number> = {};
      (data || []).forEach((r) => {
        counts[r.video_id] = (counts[r.video_id] || 0) + 1;
      });

      const sorted = Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

      if (sorted.length === 0) return [];

      const ids = sorted.map(([id]) => id);
      const { data: videos } = await supabase
        .from("youtube_videos")
        .select("id, title, thumbnail, channel_name, video_id")
        .in("id", ids);

      return sorted.map(([id, views]) => {
        const v = (videos || []).find((x) => x.id === id);
        return { id, title: v?.title || "Unknown", thumbnail: v?.thumbnail || "", channel: v?.channel_name || "", views };
      });
    },
    enabled: !!userId,
  });

  // ── Top channels ──────────────────────────────────────────────────
  const { data: topChannels = [] } = useQuery({
    queryKey: ["analytics-v2-top-channels", period],
    queryFn: async () => {
      const since = period === "all" ? undefined : subDays(new Date(), days).toISOString();
      let q = supabase
        .from("user_video_interactions")
        .select("video_id")
        .eq("interaction_type", "view");
      if (since) q = q.gte("created_at", since);
      const { data: interactions } = await q;

      if (!interactions?.length) return [];

      const videoIds = [...new Set(interactions.map((i) => i.video_id))];
      const { data: videos } = await supabase
        .from("youtube_videos")
        .select("id, channel_id, channel_name")
        .in("id", videoIds);

      const channelViews: Record<string, { name: string; views: number }> = {};
      interactions.forEach((i) => {
        const v = (videos || []).find((x) => x.id === i.video_id);
        if (!v) return;
        if (!channelViews[v.channel_id]) channelViews[v.channel_id] = { name: v.channel_name, views: 0 };
        channelViews[v.channel_id].views++;
      });

      const { data: channelData } = await supabase
        .from("youtube_channels")
        .select("channel_id, thumbnail_url")
        .in("channel_id", Object.keys(channelViews));

      return Object.entries(channelViews)
        .sort(([, a], [, b]) => b.views - a.views)
        .slice(0, 10)
        .map(([cid, info]) => ({
          id: cid,
          name: info.name,
          views: info.views,
          thumbnail: (channelData || []).find((c) => c.channel_id === cid)?.thumbnail_url || "",
        }));
    },
    enabled: !!userId,
  });

  // ── Top pages ─────────────────────────────────────────────────────
  const { data: topPages = [] } = useQuery({
    queryKey: ["analytics-v2-top-pages", period],
    queryFn: async () => {
      const since = period === "all" ? undefined : subDays(new Date(), days).toISOString();
      let q = supabase.from("user_analytics").select("page_path");
      if (since) q = q.gte("session_start", since);
      const { data } = await q;

      const counts: Record<string, number> = {};
      (data || []).forEach((r) => {
        counts[r.page_path] = (counts[r.page_path] || 0) + 1;
      });

      return Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([path, views]) => ({ path, views }));
    },
    enabled: !!userId,
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  const s = stats || { totalChannels: 0, totalVideos: 0, totalViews: 0, totalUsers: 0, activeUsers: 0, weeklyUsers: 0, monthlyUsers: 0, totalHours: 0 };

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Period selector */}
      <div className="flex items-center gap-2">
        {(["7d", "30d", "all"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === p ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white hover:bg-[#1e2028]"
            }`}
          >
            {p === "7d" ? "Last 7 Days" : p === "30d" ? "Last 30 Days" : "All Time"}
          </button>
        ))}
      </div>

      {/* KPI row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Total Channels" value={s.totalChannels} icon={Tv} accent="bg-indigo-600" />
        <KPI label="Total Videos" value={s.totalVideos} icon={Video} accent="bg-sky-600" />
        <KPI label="Total Views" value={s.totalViews} icon={Eye} accent="bg-emerald-600" />
        <KPI label="Total Users" value={s.totalUsers} icon={Users} accent="bg-amber-600" />
      </div>

      {/* KPI row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Active Now" value={s.activeUsers} icon={Activity} accent="bg-emerald-600" subtitle="Live sessions" />
        <KPI label="Weekly Users" value={s.weeklyUsers} icon={CalendarDays} accent="bg-sky-600" />
        <KPI label="Monthly Users" value={s.monthlyUsers} icon={UserCheck} accent="bg-indigo-600" />
        <KPI label="Total Hours" value={s.totalHours} icon={Clock} accent="bg-amber-600" subtitle="Session time" />
      </div>

      {/* Chart */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Sessions & Users Over Time</h3>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradSessions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2028" />
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} interval={period === "7d" ? 0 : "preserveStartEnd"} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1b24", border: "1px solid #2a2b35", borderRadius: 8, color: "#fff", fontSize: 12 }}
                labelStyle={{ color: "#9ca3af" }}
              />
              <Area type="monotone" dataKey="sessions" stroke="#6366f1" fill="url(#gradSessions)" strokeWidth={2} name="Sessions" />
              <Area type="monotone" dataKey="users" stroke="#22d3ee" fill="url(#gradUsers)" strokeWidth={2} name="Unique Users" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Bottom grid: Top Videos, Top Channels, Top Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Top Videos */}
        <Card className="flex flex-col">
          <div className="p-4 border-b border-[#1e2028]">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Play className="w-4 h-4 text-indigo-400" /> Top Videos
            </h3>
          </div>
          <ScrollArea className="flex-1 max-h-[380px]">
            {topVideos.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-8">No data yet</p>
            ) : (
              topVideos.map((v, i) => (
                <div key={v.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#1a1b24] transition-colors border-b border-[#1e2028]/30">
                  <span className="text-xs font-bold text-gray-600 w-5 text-right">{i + 1}</span>
                  <img src={v.thumbnail} alt="" className="w-14 h-8 rounded object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white truncate">{v.title}</p>
                    <p className="text-[10px] text-gray-500">{v.channel}</p>
                  </div>
                  <span className="text-xs font-medium text-indigo-400">{fmt(v.views)}</span>
                </div>
              ))
            )}
          </ScrollArea>
        </Card>

        {/* Top Channels */}
        <Card className="flex flex-col">
          <div className="p-4 border-b border-[#1e2028]">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Tv className="w-4 h-4 text-sky-400" /> Top Channels
            </h3>
          </div>
          <ScrollArea className="flex-1 max-h-[380px]">
            {topChannels.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-8">No data yet</p>
            ) : (
              topChannels.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#1a1b24] transition-colors border-b border-[#1e2028]/30">
                  <span className="text-xs font-bold text-gray-600 w-5 text-right">{i + 1}</span>
                  {c.thumbnail ? (
                    <img src={c.thumbnail} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#1e2028] shrink-0" />
                  )}
                  <p className="flex-1 text-xs text-white truncate">{c.name}</p>
                  <span className="text-xs font-medium text-sky-400">{fmt(c.views)}</span>
                </div>
              ))
            )}
          </ScrollArea>
        </Card>

        {/* Top Pages */}
        <Card className="flex flex-col">
          <div className="p-4 border-b border-[#1e2028]">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" /> Top Pages
            </h3>
          </div>
          <ScrollArea className="flex-1 max-h-[380px]">
            {topPages.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-8">No data yet</p>
            ) : (
              topPages.map((p, i) => (
                <div key={p.path} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#1a1b24] transition-colors border-b border-[#1e2028]/30">
                  <span className="text-xs font-bold text-gray-600 w-5 text-right">{i + 1}</span>
                  <p className="flex-1 text-xs text-white truncate font-mono">{p.path}</p>
                  <span className="text-xs font-medium text-emerald-400">{fmt(p.views)}</span>
                </div>
              ))
            )}
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
};
