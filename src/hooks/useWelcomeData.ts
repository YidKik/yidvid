
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useWelcomeData = (session: any) => {
  const { data: profile, isLoading: isLoadingProfile, error: profileError } = useQuery({
    queryKey: ["profile", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      try {
        console.log("Fetching profile for user ID:", session?.user?.id);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session?.user?.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching profile:", error);
          return null;
        }
        
        return data;
      } catch (err) {
        console.error("Unexpected error fetching profile:", err);
        return null;
      }
    },
    retry: 1,
    // Don't trigger error boundaries for this query
    meta: {
      errorMessage: "Failed to load profile"
    },
    // Provide a fallback on error
    onError: (error) => {
      console.error("Profile fetch error handled silently:", error);
    }
  });

  const { data: videos, isLoading: isLoadingVideos, isError: isVideosError } = useQuery({
    queryKey: ["youtube_videos"],
    queryFn: async () => {
      console.log("Prefetching videos during welcome animation...");
      try {
        const { data, error } = await supabase
          .from("youtube_videos")
          .select("*")
          .is('deleted_at', null)
          .order("uploaded_at", { ascending: false });

        if (error) {
          console.error("Error fetching videos:", error);
          return [];
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
      } catch (err) {
        console.error("Unexpected error fetching videos:", err);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 1,
    // Silent failure - don't show errors to users
    onError: (error) => {
      console.error("Videos fetch error handled silently:", error);
    }
  });

  const { data: channels, isLoading: isLoadingChannels, isError: isChannelsError } = useQuery({
    queryKey: ["youtube_channels"],
    queryFn: async () => {
      console.log("Prefetching channels during welcome animation...");
      try {
        const { data, error } = await supabase
          .from("youtube_channels")
          .select("*")
          .is("deleted_at", null);

        if (error) {
          console.error("Error fetching channels:", error);
          return [];
        }

        return data || [];
      } catch (err) {
        console.error("Unexpected error fetching channels:", err);
        return [];
      }
    },
    retry: 1,
    // Silent failure - don't show errors to users
    onError: (error) => {
      console.error("Channels fetch error handled silently:", error);
    }
  });

  // Create a fallback username if profile fetch fails
  const userName = profile?.welcome_name || 
                  profile?.display_name || 
                  profile?.name || 
                  (session?.user?.email ? session.user.email.split('@')[0] : "to YidVid");

  return {
    profile,
    channels,
    videos,
    isLoading: isLoadingVideos || isLoadingChannels || isLoadingProfile,
    isError: isVideosError || isChannelsError,
    profileError,
    userName
  };
};
