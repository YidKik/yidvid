import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Clock, Eye, Layout } from "lucide-react";

export const UserAnalyticsSection = () => {
  const { data: analytics } = useQuery({
    queryKey: ["user-analytics"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      // Fetch video history for unique videos count
      const { data: videoHistory, error: videoError } = await supabase
        .from("video_history")
        .select("video_id")
        .eq("user_id", session.user.id);

      if (videoError) {
        console.error("Error fetching video history:", videoError);
        return null;
      }

      // Get unique videos viewed
      const uniqueVideos = new Set(videoHistory?.map(h => h.video_id));

      // Get unique channels from video history
      const { data: channelData, error: channelError } = await supabase
        .from("video_history")
        .select(`
          video:youtube_videos!inner (
            channel_id
          )
        `)
        .eq("user_id", session.user.id);

      if (channelError) {
        console.error("Error fetching channel data:", channelError);
        return null;
      }

      // Get unique channels viewed
      const uniqueChannels = new Set(channelData?.map(d => d.video.channel_id));

      // Calculate total watch time
      const { data: sessions } = await supabase
        .from("user_analytics")
        .select("*")
        .eq("user_id", session.user.id);

      const totalTimeSpent = sessions?.reduce((total, session) => {
        if (!session.session_end) return total;
        const start = new Date(session.session_start);
        const end = new Date(session.session_end);
        return total + (end.getTime() - start.getTime());
      }, 0) || 0;

      return {
        totalTimeSpent,
        uniqueVideosViewed: uniqueVideos.size,
        uniqueChannelsViewed: uniqueChannels.size,
      };
    },
  });

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} days`;
    if (hours > 0) return `${hours} hours`;
    if (minutes > 0) return `${minutes} minutes`;
    return `${seconds} seconds`;
  };

  if (!analytics) return null;

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold mb-4">Your Viewing Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 flex flex-col items-center text-center">
          <Clock className="h-8 w-8 mb-2" />
          <h3 className="text-lg font-medium">Total Time Spent</h3>
          <p className="text-2xl font-bold mt-2">
            {formatTime(analytics.totalTimeSpent)}
          </p>
        </Card>

        <Card className="p-6 flex flex-col items-center text-center">
          <Eye className="h-8 w-8 mb-2" />
          <h3 className="text-lg font-medium">Videos Viewed</h3>
          <p className="text-2xl font-bold mt-2">
            {analytics.uniqueVideosViewed}
          </p>
        </Card>

        <Card className="p-6 flex flex-col items-center text-center">
          <Layout className="h-8 w-8 mb-2" />
          <h3 className="text-lg font-medium">Total Channels Viewed</h3>
          <p className="text-2xl font-bold mt-2">
            {analytics.uniqueChannelsViewed}
          </p>
        </Card>
      </div>
    </section>
  );
};