import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";

export const DashboardAnalytics = () => {
  const { data: viewsData, isLoading } = useQuery({
    queryKey: ["video-views"],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from("youtube_videos")
        .select("views, uploaded_at")
        .gte("uploaded_at", sevenDaysAgo.toISOString())
        .order("uploaded_at", { ascending: true });

      if (error) throw error;

      // Group by day and sum views
      const dailyViews = data.reduce((acc: any, video) => {
        const date = new Date(video.uploaded_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + (video.views || 0);
        return acc;
      }, {});

      return Object.entries(dailyViews).map(([date, views]) => ({
        date,
        views,
      }));
    },
  });

  const { data: totalStats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data: channels, error: channelsError } = await supabase
        .from("youtube_channels")
        .select("channel_id", { count: "exact" });

      const { data: videos, error: videosError } = await supabase
        .from("youtube_videos")
        .select("views");

      if (channelsError || videosError) throw channelsError || videosError;

      const totalViews = videos?.reduce((sum, video) => sum + (video.views || 0), 0);

      return {
        totalChannels: channels?.length || 0,
        totalVideos: videos?.length || 0,
        totalViews: totalViews || 0,
      };
    },
  });

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
          <CardDescription>Combined video views</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            {totalStats?.totalViews.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Views Over Time</CardTitle>
          <CardDescription>Last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer
              config={{
                views: {
                  theme: {
                    light: "hsl(var(--primary))",
                    dark: "hsl(var(--primary))",
                  },
                },
              }}
            >
              <AreaChart data={viewsData}>
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary)/.2)"
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};