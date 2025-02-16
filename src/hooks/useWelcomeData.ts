
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useWelcomeData = (session: any) => {
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session?.user?.id)
        .maybeSingle();
      
      return data;
    },
  });

  const { isLoading: isLoadingVideos, isError: isVideosError } = useQuery({
    queryKey: ["youtube_videos"],
    queryFn: async () => {
      console.log("Prefetching videos during welcome animation...");
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .is('deleted_at', null)
        .order("uploaded_at", { ascending: false });

      if (error) {
        console.error("Error fetching videos:", error);
        toast.error("Failed to load videos");
        throw error;
      }

      return (data || []).map(video => ({
        id: video.id,
        video_id: video.video_id,
        title: video.title,
        thumbnail: video.thumbnail,
        channelName: video.channel_name,
        channelId: video.channel_id,
        views: video.views || 0,
        uploadedAt: video.uploaded_at
      }));
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 3,
  });

  const { isLoading: isLoadingChannels, isError: isChannelsError } = useQuery({
    queryKey: ["youtube_channels"],
    queryFn: async () => {
      console.log("Prefetching channels during welcome animation...");
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*");

      if (error) {
        console.error("Error fetching channels:", error);
        return [];
      }

      return data || [];
    },
  });

  return {
    profile,
    isLoading: isLoadingVideos || isLoadingChannels || isLoadingProfile,
    isError: isVideosError || isChannelsError,
    userName: profile?.name || session?.user?.user_metadata?.full_name || "to YidVid"
  };
};
