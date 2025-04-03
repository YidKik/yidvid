
import { AnalyticsStats } from "@/hooks/useAnalyticsData";
import { StatCard } from "./StatCard";
import { Clock, Users, PieChart, BarChart } from "lucide-react";

interface AnalyticsGridProps {
  stats: AnalyticsStats;
}

export const AnalyticsGrid = ({ stats }: AnalyticsGridProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
      <StatCard 
        title="Total Channels" 
        description="Number of tracked channels" 
        value={stats.totalChannels}
      />
      
      <StatCard 
        title="Total Videos" 
        description="Across all channels" 
        value={stats.totalVideos}
      />
      
      <StatCard 
        title="Total Views" 
        description="Total video views on website" 
        value={stats.totalViews}
      />

      <StatCard 
        title="Total Users" 
        description="Registered accounts" 
        value={stats.totalUsers}
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
      />

      <StatCard 
        title="Anonymous Users" 
        description="Visitors without accounts" 
        value={stats.anonymousUsers}
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
      />

      <StatCard 
        title="Total Watch Time" 
        description="Hours spent on website" 
        value={stats.totalHours}
        icon={<Clock className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  );
};
