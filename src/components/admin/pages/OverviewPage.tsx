import { Video, Users, MessageSquare, Tv, Activity, Download, Shield } from "lucide-react";
import { StatCard } from "@/components/admin/shared/StatCard";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useVideoModeration } from "@/hooks/admin/useVideoModeration";
import { ApiQuotaStatus } from "@/components/admin/dashboard/ApiQuotaStatus";
import { VideoFetchButton } from "@/components/admin/VideoFetchButton";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export const OverviewPage = () => {
  const { stats, isStatsLoading } = useDashboardStats(true, undefined);
  const { stats: modStats, isLoading: modLoading } = useVideoModeration();
  const qc = useQueryClient();

  if (isStatsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[hsl(220,10%,55%)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Videos" value={stats?.totalVideos ?? 0} icon={Video} color="bg-[hsl(250,80%,60%)]" />
        <StatCard label="Total Channels" value={stats?.totalChannels ?? 0} icon={Tv} color="bg-[hsl(200,80%,50%)]" />
        <StatCard label="Total Users" value={stats?.totalUsers ?? 0} icon={Users} color="bg-[hsl(150,60%,45%)]" />
        <StatCard label="Total Comments" value={stats?.totalComments ?? 0} icon={MessageSquare} color="bg-[hsl(35,90%,55%)]" />
      </div>

      {/* Moderation summary + quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Moderation Summary */}
        <div className="bg-white rounded-xl border border-[hsl(220,13%,91%)] p-6">
          <h2 className="text-base font-semibold text-[hsl(220,15%,18%)] mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Content Moderation
          </h2>
          {modLoading ? (
            <div className="py-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <MiniStat label="Pending Review" value={modStats.pending + modStats.manualReview} color="hsl(35,90%,55%)" />
              <MiniStat label="Approved" value={modStats.approved} color="hsl(150,60%,45%)" />
              <MiniStat label="Rejected" value={modStats.rejected} color="hsl(0,72%,51%)" />
              <MiniStat label="Total Analyzed" value={modStats.total} color="hsl(250,80%,60%)" />
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-[hsl(220,13%,91%)] p-6">
          <h2 className="text-base font-semibold text-[hsl(220,15%,18%)] mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Quick Actions
          </h2>
          <div className="space-y-3">
            <VideoFetchButton onFetchComplete={() => qc.invalidateQueries({ queryKey: ["dashboard-stats"] })} />
            <p className="text-xs text-[hsl(220,10%,55%)]">
              Fetch latest videos from all active YouTube channels and run AI content filtering.
            </p>
          </div>
        </div>
      </div>

      {/* API Quota */}
      <ApiQuotaStatus />
    </div>
  );
};

const MiniStat = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="flex items-center gap-3">
    <div className="w-2 h-8 rounded-full" style={{ backgroundColor: color }} />
    <div>
      <p className="text-xs text-[hsl(220,10%,50%)]">{label}</p>
      <p className="text-xl font-bold text-[hsl(220,15%,18%)]">{value.toLocaleString()}</p>
    </div>
  </div>
);
