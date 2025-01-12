import { useQuery } from "@tanstack/react-query";
import { VideoCard } from "./VideoCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "./ui/use-toast";
import { useEffect, useState } from "react";
import { VideoGridHeader } from "./video/VideoGridHeader";
import { FeaturedVideos } from "./video/FeaturedVideos";

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
        toast({
          title: "Error",
          description: "Failed to fetch user interactions",
          variant: "destructive",
        });
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
        toast({
          title: "Error",
          description: "Failed to fetch channels",
          variant: "destructive",
        });
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
        // First, try to fetch new videos from YouTube
        const { error: fetchError, data: fetchResponse } = await supabase.functions.invoke("fetch-youtube-videos", {
          body: { channels: channels.map(c => c.channel_id) }
        });
        
        if (fetchError) {
          console.error("Error fetching videos from YouTube:", fetchError);
          toast({
            title: "Warning",
            description: "Some videos might not be up to date",
            variant: "destructive",
          });
        } else {
          console.log("Fetch response:", fetchResponse);
        }

        // Then fetch all videos from the database
        const { data: videosData, error } = await supabase
          .from("youtube_videos")
          .select("*, youtube_channels!inner(thumbnail_url)")
          .in("channel_id", channels.map(c => c.channel_id))
          .order("uploaded_at", { ascending: false });

        if (error) {
          console.error("Error fetching videos:", error);
          toast({
            title: "Error",
            description: "Failed to fetch videos",
            variant: "destructive",
          });
          throw error;
        }

        if (!videosData || videosData.length === 0) {
          toast({
            title: "No videos found",
            description: "Try adding some channels first",
          });
          return [];
        }

        // Transform video data and sort based on user interactions
        const processedVideos = videosData.map((video: any) => ({
          ...video,
          uploadedAt: new Date(video.uploaded_at),
          channelThumbnail: video.youtube_channels.thumbnail_url,
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
        <>
          <FeaturedVideos 
            videos={videos} 
            onVideoClick={handleVideoView}
          />
          
          <div className="w-full max-w-[1800px] mx-auto mt-8">
            <h2 className="text-2xl font-bold px-4 mb-8 text-accent">All Videos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
              {videos.slice(2).map((video) => (
                <div key={video.id} onClick={() => handleVideoView(video.id)}>
                  <VideoCard {...video} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};