import { useQuery } from "@tanstack/react-query";
import { VideoCard } from "./VideoCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "./ui/use-toast";
import { useEffect, useState } from "react";
import { VideoGridHeader } from "./video/VideoGridHeader";

export const VideoGrid = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user's video interactions
  const { data: userInteractions } = useQuery({
    queryKey: ["user-interactions"],
    queryFn: async () => {
      if (!session?.user) return [];
      
      const { data, error } = await supabase
        .from("user_video_interactions")
        .select("video_id, interaction_type")
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Error fetching user interactions:", error);
        return [];
      }
      
      return data;
    },
    enabled: !!session?.user,
  });

  const { data: channels, isLoading: isLoadingChannels } = useQuery({
    queryKey: ["youtube-channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching channels:", error);
        throw error;
      }
      
      return data;
    },
  });

  const { data: videos, isLoading: isLoadingVideos } = useQuery({
    queryKey: ["youtube-videos", channels?.map(c => c.channel_id), userInteractions],
    queryFn: async () => {
      if (!channels?.length) {
        return [];
      }

      toast({
        title: "Fetching videos...",
        description: "This may take a few moments",
      });

      try {
        const { error: fetchError } = await supabase.functions.invoke("fetch-youtube-videos", {
          body: { channels: channels.map(c => c.channel_id) }
        });
        
        if (fetchError) {
          console.error("Error fetching videos from YouTube:", fetchError);
          toast({
            title: "Error fetching videos",
            description: "Please try again later",
            variant: "destructive",
          });
          throw fetchError;
        }

        const { data, error } = await supabase
          .from("youtube_videos")
          .select("*")
          .in("channel_id", channels.map(c => c.channel_id))
          .order("uploaded_at", { ascending: false });

        if (error) {
          console.error("Error fetching videos:", error);
          throw error;
        }

        // Transform video data and sort based on user interactions
        const processedVideos = data.map((video: any) => ({
          ...video,
          uploadedAt: new Date(video.uploaded_at),
          interactionScore: calculateInteractionScore(video.id, userInteractions || [])
        }));

        // Sort videos by interaction score (personalized) and then by upload date
        const sortedVideos = processedVideos.sort((a, b) => {
          if (b.interactionScore !== a.interactionScore) {
            return b.interactionScore - a.interactionScore;
          }
          return b.uploadedAt.getTime() - a.uploadedAt.getTime();
        });

        toast({
          title: "Videos fetched successfully",
          description: session?.user 
            ? "Your personalized feed has been updated"
            : "Showing recommended videos",
        });

        return sortedVideos;
      } catch (error) {
        console.error("Error in video fetch process:", error);
        toast({
          title: "Error fetching videos",
          description: "Please try again later",
          variant: "destructive",
        });
        throw error;
      }
    },
    enabled: !!channels?.length,
  });

  // Track video views
  const handleVideoView = async (videoId: string) => {
    if (!session?.user) return;

    try {
      const { error } = await supabase
        .from("user_video_interactions")
        .insert({
          user_id: session.user.id,
          video_id: videoId,
          interaction_type: "view"
        });

      if (error) {
        console.error("Error tracking video view:", error);
      }
    } catch (error) {
      console.error("Error tracking video view:", error);
    }
  };

  const calculateInteractionScore = (videoId: string, interactions: any[]) => {
    const videoInteractions = interactions.filter(i => i.video_id === videoId);
    return videoInteractions.length;
  };

  const isLoading = isLoadingChannels || isLoadingVideos;

  return (
    <div className="space-y-4">
      <VideoGridHeader 
        isLoading={isLoading}
        hasChannels={!!channels?.length}
        hasVideos={!!videos?.length}
      />
      
      {videos?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
          {videos.map((video) => (
            <div key={video.id} onClick={() => handleVideoView(video.id)}>
              <VideoCard {...video} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};