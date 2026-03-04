import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { StatCard } from "@/components/admin/shared/StatCard";
import { Tv, Video, Eye, Users, Clock, Activity, UserCheck, CalendarDays } from "lucide-react";
import { Loader2 } from "lucide-react";
import { GoogleAnalyticsOverview } from "@/components/admin/analytics/GoogleAnalyticsOverview";

interface AnalyticsPageProps {
  userId: string | undefined;
}

export const AnalyticsPage = ({ userId }: AnalyticsPageProps) => {
  const { totalStats, isLoading } = useAnalyticsData(userId);

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  if (!totalStats) {
    return <p className="text-sm text-[hsl(220,10%,55%)] py-8 text-center">Unable to load analytics data.</p>;
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Core stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Channels" value={totalStats.totalChannels} icon={Tv} color="bg-[hsl(250,80%,60%)]" />
        <StatCard label="Total Videos" value={totalStats.totalVideos} icon={Video} color="bg-[hsl(200,80%,50%)]" />
        <StatCard label="Total Views" value={totalStats.totalViews} icon={Eye} color="bg-[hsl(150,60%,45%)]" />
        <StatCard label="Total Users" value={totalStats.totalUsers} icon={Users} color="bg-[hsl(35,90%,55%)]" />
      </div>

      {/* Session stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Now" value={totalStats.activeUsers} icon={Activity} color="bg-[hsl(150,60%,45%)]" subtitle="Active sessions" />
        <StatCard label="Weekly Users" value={totalStats.weeklyUsers} icon={CalendarDays} color="bg-[hsl(200,80%,50%)]" />
        <StatCard label="Monthly Users" value={totalStats.monthlyUsers} icon={UserCheck} color="bg-[hsl(250,80%,60%)]" />
        <StatCard label="Total Hours" value={totalStats.totalHours} icon={Clock} color="bg-[hsl(35,90%,55%)]" subtitle={`Peak hour: ${totalStats.mostPopularHour}:00`} />
      </div>

      {/* Google Analytics */}
      <div className="bg-white rounded-xl border border-[hsl(220,13%,91%)] p-6">
        <h2 className="text-base font-semibold text-[hsl(220,15%,18%)] mb-4">Google Analytics</h2>
        <GoogleAnalyticsOverview />
      </div>
    </div>
  );
};
