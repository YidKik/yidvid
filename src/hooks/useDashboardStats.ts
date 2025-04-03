
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardStats } from "@/types/dashboard";

/**
 * Custom hook to fetch dashboard statistics
 */
export const useDashboardStats = (isAdmin: boolean, userId: string | undefined) => {
  // Query dashboard stats only if user is admin
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      console.log("Fetching dashboard stats...");
      try {
        const [channelsResponse, videosResponse, commentsResponse, usersResponse] = await Promise.all([
          supabase.from("youtube_channels").select("*", { count: "exact", head: true }),
          supabase.from("youtube_videos").select("*", { count: "exact", head: true }),
          supabase.from("video_comments").select("*", { count: "exact", head: true }),
          supabase.from("profiles").select("*", { count: "exact", head: true })
        ]);
        
        return {
          totalChannels: channelsResponse.count || 0,
          totalVideos: videosResponse.count || 0,
          totalComments: commentsResponse.count || 0,
          totalUsers: usersResponse.count || 0
        };
      } catch (error) {
        console.error("Stats fetch error:", error);
        return {
          totalChannels: 0,
          totalVideos: 0,
          totalComments: 0,
          totalUsers: 0
        };
      }
    },
    enabled: isAdmin,
    retry: 2,
    staleTime: 60000, // Cache for 1 minute
  });

  return { stats, isStatsLoading };
};
