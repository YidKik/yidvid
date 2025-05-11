
import { StatCard } from "@/components/dashboard/analytics/StatCard";
import { Grid3X3, MessageSquare, Film, Eye, Clock, Users, Activity } from "lucide-react";
import { AnalyticsStats } from "@/hooks/useAnalyticsData";

interface AnalyticsGridProps {
  stats?: AnalyticsStats;
}

export const AnalyticsGrid = ({ stats }: AnalyticsGridProps) => {
  // Default values in case stats is undefined
  const totalChannels = stats?.totalChannels ?? 0;
  const totalVideos = stats?.totalVideos ?? 0;
  const totalViews = stats?.totalViews ?? 0;
  const totalUsers = stats?.totalUsers ?? 0;
  const totalHours = stats?.totalHours ?? 0;
  const popularHour = stats?.mostPopularHour ?? 0;
  const anonymousUsers = stats?.anonymousUsers ?? 0;

  // Format the popular hour in 12-hour format with AM/PM
  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard 
        title="Channels" 
        value={totalChannels.toLocaleString()}
        icon={<Grid3X3 className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard 
        title="Videos" 
        value={totalVideos.toLocaleString()} 
        icon={<Film className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard 
        title="Total Views" 
        value={totalViews.toLocaleString()} 
        icon={<Eye className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard 
        title="Total Users" 
        value={totalUsers.toLocaleString()} 
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard 
        title="Watch Time" 
        value={`${totalHours.toLocaleString()} hours`} 
        icon={<Clock className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard 
        title="Peak Activity" 
        value={formatHour(popularHour)} 
        description="Most active hour"
        icon={<Activity className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard 
        title="Anonymous Users" 
        value={anonymousUsers.toLocaleString()} 
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  );
};
