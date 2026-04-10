import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Video,
  Tv,
  Users,
  MessageSquare,
  Eye,
  TrendingUp,
  Clock,
  Activity,
  Shield,
  Download,
  RefreshCw,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { VideoFetchButton } from "@/components/admin/VideoFetchButton";
import { useVideoModeration } from "@/hooks/admin/useVideoModeration";
import { useQueryClient } from "@tanstack/react-query";

export const OverviewPageV2 = () => {
  const qc = useQueryClient();
  const { stats: modStats, isLoading: modLoading } = useVideoModeration();

  // Core stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-v2-overview-stats"],
    queryFn: async () => {
      // Active sessions: session_end is null AND started within the last 8 hours (avoids stale sessions)
      const eightHoursAgo = new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString();

      const [channels, videos, users, comments, activeNow] = await Promise.all([
        supabase.from("youtube_channels").select("*", { count: "exact", head: true }).is("deleted_at", null),
        supabase.from("youtube_videos").select("*", { count: "exact", head: true }).is("deleted_at", null),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("video_comments").select("*", { count: "exact", head: true }),
        supabase.from("user_analytics").select("*", { count: "exact", head: true })
          .is("session_end", null)
          .gte("session_start", eightHoursAgo),
      ]);

      // Sum all views from youtube_videos
      const { data: viewsData } = await supabase
        .from("youtube_videos")
        .select("views")
        .is("deleted_at", null);
      const totalViews = (viewsData || []).reduce((sum, v) => sum + (v.views || 0), 0);

      return {
        channels: channels.count || 0,
        videos: videos.count || 0,
        users: users.count || 0,
        comments: comments.count || 0,
        views: totalViews,
        activeNow: activeNow.count || 0,
      };
    },
    refetchInterval: 30000,
  });

  // YouTube API Quota
  const { data: quotaData } = useQuery({
    queryKey: ["admin-v2-quota"],
    queryFn: async () => {
      const { data } = await supabase
        .from("api_quota_tracking")
        .select("*")
        .eq("api_name", "youtube")
        .single();
      return data;
    },
    refetchInterval: 30000,
  });

  // Latest fetch log
  const { data: latestFetch } = useQuery({
    queryKey: ["admin-v2-latest-fetch"],
    queryFn: async () => {
      const { data } = await supabase
        .from("video_fetch_logs")
        .select("*")
        .order("fetch_time", { ascending: false })
        .limit(1)
        .single();
      return data;
    },
  });

  // Recent contact requests
  const { data: recentContacts } = useQuery({
    queryKey: ["admin-v2-recent-contacts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("contact_requests")
        .select("id, name, email, category, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  // Recent channel requests
  const { data: recentChannelRequests } = useQuery({
    queryKey: ["admin-v2-recent-channel-requests"],
    queryFn: async () => {
      const { data } = await supabase
        .from("channel_requests")
        .select("id, channel_name, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-[#6366f1]" />
      </div>
    );
  }

  const quotaLimit = 10000;
  const quotaRemaining = quotaData?.quota_remaining || 0;
  const quotaPct = (quotaRemaining / quotaLimit) * 100;

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard icon={Tv} label="Channels" value={stats?.channels || 0} color="#6366f1" />
        <KpiCard icon={Video} label="Videos" value={stats?.videos || 0} color="#3b82f6" />
        <KpiCard icon={Users} label="Users" value={stats?.users || 0} color="#10b981" />
        <KpiCard icon={MessageSquare} label="Comments" value={stats?.comments || 0} color="#f59e0b" />
        <KpiCard icon={Eye} label="Total Views" value={stats?.views || 0} color="#ec4899" />
        <KpiCard icon={Activity} label="Active Now" value={stats?.activeNow || 0} color="#14b8a6" accent />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - wider */}
        <div className="lg:col-span-2 space-y-6">
          {/* Content Moderation Summary */}
          <DarkCard title="Content Moderation" icon={Shield}>
            {modLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-[#565b6e]" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <MiniStat label="Pending" value={modStats.pending + modStats.manualReview} color="#f59e0b" />
                <MiniStat label="Approved" value={modStats.approved} color="#10b981" />
                <MiniStat label="Rejected" value={modStats.rejected} color="#ef4444" />
                <MiniStat label="Total" value={modStats.total} color="#6366f1" />
              </div>
            )}
          </DarkCard>

          {/* Recent Contact Requests */}
          <DarkCard title="Recent Contact Requests" icon={MessageSquare}>
            {recentContacts && recentContacts.length > 0 ? (
              <div className="divide-y divide-[#1e2028]">
                {recentContacts.map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-[#c4c7d4] truncate">{c.name}</p>
                      <p className="text-[11px] text-[#565b6e]">{c.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusPill status={c.status} />
                      <span className="text-[10px] text-[#4a4e5e]">
                        {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[#565b6e] text-center py-4">No contact requests yet.</p>
            )}
          </DarkCard>

          {/* Recent Channel Requests */}
          <DarkCard title="Channel Requests" icon={Tv}>
            {recentChannelRequests && recentChannelRequests.length > 0 ? (
              <div className="divide-y divide-[#1e2028]">
                {recentChannelRequests.map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <p className="text-[13px] font-medium text-[#c4c7d4] truncate">{r.channel_name}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusPill status={r.status || "pending"} />
                      <span className="text-[10px] text-[#4a4e5e]">
                        {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[#565b6e] text-center py-4">No channel requests.</p>
            )}
          </DarkCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <DarkCard title="Quick Actions" icon={TrendingUp}>
            <div className="space-y-3">
              <VideoFetchButton onFetchComplete={() => qc.invalidateQueries({ queryKey: ["admin-v2-overview-stats"] })} />
              <p className="text-[11px] text-[#4a4e5e]">
                Fetch latest videos from all channels and run AI filtering.
              </p>
            </div>
          </DarkCard>

          {/* YouTube API Status */}
          <DarkCard title="YouTube API Quota" icon={Activity}>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-[#565b6e]">Remaining</span>
                  <span className="text-[12px] font-mono font-semibold text-[#c4c7d4]">
                    {quotaRemaining.toLocaleString()} / {quotaLimit.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 bg-[#1a1c25] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${quotaPct}%`,
                      backgroundColor:
                        quotaPct <= 10 ? "#ef4444" : quotaPct <= 25 ? "#f59e0b" : "#10b981",
                    }}
                  />
                </div>
                <p className="text-[10px] text-[#4a4e5e] mt-1">{quotaPct.toFixed(1)}% remaining</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-[#4a4e5e] mb-0.5">Resets In</p>
                  <p className="text-[13px] font-semibold text-[#c4c7d4]">
                    {quotaData?.quota_reset_at
                      ? formatDistanceToNow(new Date(quotaData.quota_reset_at))
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[#4a4e5e] mb-0.5">Last Fetch</p>
                  <p className="text-[13px] font-semibold text-[#c4c7d4]">
                    {latestFetch?.fetch_time
                      ? formatDistanceToNow(new Date(latestFetch.fetch_time), { addSuffix: true })
                      : "Never"}
                  </p>
                </div>
              </div>

              {latestFetch && (
                <p className="text-[10px] text-[#4a4e5e]">
                  Last run: {latestFetch.channels_processed || 0} channels, {latestFetch.videos_found || 0} videos
                </p>
              )}
            </div>
          </DarkCard>
        </div>
      </div>
    </div>
  );
};

// ── Subcomponents ──

const KpiCard = ({
  icon: Icon,
  label,
  value,
  color,
  accent,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
  accent?: boolean;
}) => (
  <div className="bg-[#13151c] border border-[#1e2028] rounded-xl p-4 hover:border-[#2a2d3a] transition-colors">
    <div className="flex items-center gap-2 mb-3">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
    </div>
    <p className="text-2xl font-bold text-white leading-tight">{value.toLocaleString()}</p>
    <p className="text-[11px] text-[#565b6e] mt-1">{label}</p>
    {accent && (
      <div className="flex items-center gap-1 mt-1">
        <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
        <span className="text-[10px] text-[#10b981]">Live</span>
      </div>
    )}
  </div>
);

const DarkCard = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) => (
  <div className="bg-[#13151c] border border-[#1e2028] rounded-xl p-5">
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-4 h-4 text-[#6366f1]" />
      <h3 className="text-[13px] font-semibold text-[#c4c7d4]">{title}</h3>
    </div>
    {children}
  </div>
);

const MiniStat = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="bg-[#0f1117] rounded-lg p-3 border border-[#1e2028]">
    <div className="flex items-center gap-2 mb-1">
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[10px] text-[#565b6e] uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-xl font-bold text-white">{value.toLocaleString()}</p>
  </div>
);

const StatusPill = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    pending: "bg-[#f59e0b]/10 text-[#f59e0b]",
    responded: "bg-[#10b981]/10 text-[#10b981]",
    added: "bg-[#6366f1]/10 text-[#818cf8]",
    approved: "bg-[#10b981]/10 text-[#10b981]",
    rejected: "bg-[#ef4444]/10 text-[#ef4444]",
  };

  return (
    <span
      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
        styles[status] || "bg-[#1e2028] text-[#8b8fa3]"
      }`}
    >
      {status}
    </span>
  );
};
