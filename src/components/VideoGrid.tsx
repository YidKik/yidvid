import { useQuery } from "@tanstack/react-query";
import { VideoCard } from "./VideoCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "./ui/use-toast";
import { useEffect, useState } from "react";
import { VideoGridHeader } from "./video/VideoGridHeader";
import { FeaturedVideos } from "./video/FeaturedVideos";
import { Button } from "./ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

export const VideoGrid = () => {
  const [session, setSession] = useState(null);
  const [showAllNewVideos, setShowAllNewVideos] = useState(false);
  const [showAllMostViewed, setShowAllMostViewed] = useState(false);

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

  // Set up realtime subscription for video updates
  useEffect(() => {
    const channel = supabase
      .channel('youtube_videos_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'youtube_videos'
        },
        (payload) => {
          console.log('Realtime update:', payload);
          // Refetch videos when changes occur
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
      
      return data || [];
    },
  });

  const { data: videos, isLoading: isLoadingVideos, refetch } = useQuery({
    queryKey: ["youtube-videos", channels?.map(c => c.channel_id)],
    queryFn: async () => {
      if (!channels?.length) {
        return [];
      }

      try {
        let query = supabase
          .from("youtube_videos")
          .select(`
            *,
            youtube_channels (
              channel_id,
              thumbnail_url
            )
          `)
          .order("uploaded_at", { ascending: false })
          .in("channel_id", channels.map(c => c.channel_id));

        const { data: videosData, error } = await query;

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

        // Transform video data
        const processedVideos = videosData.map((video: any) => ({
          ...video,
          uploadedAt: new Date(video.uploaded_at),
          channelThumbnail: video.youtube_channels?.thumbnail_url,
          interactionScore: calculateInteractionScore(video.id, userInteractions || [])
        }));

        return processedVideos;
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

  // Get latest videos for the new videos section
  const newVideos = videos ? [...videos].sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime()) : [];
  // Sort videos by views for the most viewed section
  const mostViewedVideos = videos ? [...videos].sort((a, b) => (b.views || 0) - (a.views || 0)) : [];

  // Display only first 12 videos (3 rows of 4) if not showing all
  const displayedNewVideos = showAllNewVideos ? newVideos : newVideos.slice(0, 12);
  const displayedMostViewedVideos = showAllMostViewed ? mostViewedVideos : mostViewedVideos.slice(0, 12);

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
            <div className="mt-12">
              <h2 className="text-2xl font-bold px-4 mb-8 text-accent">New Videos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
                {displayedNewVideos.map((video) => (
                  <div key={video.id} onClick={() => handleVideoView(video.id)}>
                    <VideoCard {...video} />
                  </div>
                ))}
              </div>
              {newVideos.length > 12 && (
                <div className="flex justify-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowAllNewVideos(!showAllNewVideos)}
                    className="gap-2"
                  >
                    {showAllNewVideos ? (
                      <>
                        Show Less <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        See More <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-12">
              <h2 className="text-2xl font-bold px-4 mb-8 text-accent">Most Viewed Videos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
                {displayedMostViewedVideos.map((video) => (
                  <div key={video.id} onClick={() => handleVideoView(video.id)}>
                    <VideoCard {...video} />
                  </div>
                ))}
              </div>
              {mostViewedVideos.length > 12 && (
                <div className="flex justify-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowAllMostViewed(!showAllMostViewed)}
                    className="gap-2"
                  >
                    {showAllMostViewed ? (
                      <>
                        Show Less <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        See More <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};