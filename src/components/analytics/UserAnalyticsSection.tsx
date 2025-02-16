
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Clock, Eye, Layout } from "lucide-react";

export const UserAnalyticsSection = () => {
  const { data: analytics, isLoading } = useQuery({
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
      const uniqueVideos = new Set(videoHistory?.map(h => h.video_id) || []);

      // Get unique channels from video history
      const { data: channelData, error: channelError } = await supabase
        .from("video_history")
        .select(`
          videos:video_id (
            channel_id
          )
        `)
        .eq("user_id", session.user.id);

      if (channelError) {
        console.error("Error fetching channel data:", channelError);
        return null;
      }

      // Get unique channels viewed
      const uniqueChannels = new Set(
        channelData
          ?.filter(d => d.videos?.channel_id) // Filter out any null values
          .map(d => d.videos?.channel_id) || []
      );

      // Calculate total watch time from user_analytics
      const { data: sessions, error: sessionsError } = await supabase
        .from("user_analytics")
        .select("*")
        .eq("user_id", session.user.id)
        .not('session_end', 'is', null);

      if (sessionsError) {
        console.error("Error fetching sessions:", sessionsError);
        return null;
      }

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
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      const remainingHours = hours % 24;
      if (remainingHours === 0) {
        return `${days} day${days !== 1 ? 's' : ''}`;
      }
      return `${days} day${days !== 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
    }
    
    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
      }
      return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
    }
    
    if (minutes > 0) {
      const remainingSeconds = seconds % 60;
      if (remainingSeconds === 0) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
      }
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
    }
    
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  };

  if (isLoading) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Your Viewing Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 flex flex-col items-center text-center animate-pulse">
              <div className="h-8 w-8 rounded-full bg-gray-200 mb-2" />
              <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-6 w-16 bg-gray-200 rounded" />
            </Card>
          ))}
        </div>
      </section>
    );
  }

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
          <h3 className="text-lg font-medium">Channels Viewed</h3>
          <p className="text-2xl font-bold mt-2">
            {analytics.uniqueChannelsViewed}
          </p>
        </Card>
      </div>
    </section>
  );
};
