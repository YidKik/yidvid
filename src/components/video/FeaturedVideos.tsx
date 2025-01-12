import { useEffect, useState } from "react";
import { VideoCard } from "../VideoCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FeaturedVideosProps {
  videos: any[];
  onVideoClick: (videoId: string) => void;
}

export const FeaturedVideos = ({ videos, onVideoClick }: FeaturedVideosProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: mostViewedChannels } = useQuery({
    queryKey: ["most-viewed-channels", session?.user?.id],
    queryFn: async () => {
      if (!session?.user) return null;

      try {
        const { data, error } = await supabase
          .from("user_video_interactions")
          .select(`
            video_id,
            youtube_videos (
              channel_id,
              channel_name
            )
          `)
          .eq("user_id", session.user.id)
          .eq("interaction_type", "view");

        if (error) {
          console.error("Error fetching user interactions:", error);
          toast.error("Unable to load personalized recommendations");
          return null;
        }

        if (!data || data.length === 0) {
          return null;
        }

        const channelViews = data.reduce((acc: any, curr: any) => {
          const channelId = curr.youtube_videos?.channel_id;
          if (channelId) {
            acc[channelId] = (acc[channelId] || 0) + 1;
          }
          return acc;
        }, {});

        return Object.entries(channelViews)
          .sort(([, a]: any, [, b]: any) => b - a)
          .map(([channelId]) => channelId);
      } catch (error) {
        console.error("Error in fetching channel views:", error);
        toast.error("Error loading recommendations");
        return null;
      }
    },
    enabled: !!session?.user,
    retry: false,
  });

  const getFeaturedVideos = () => {
    if (!videos.length) return [];
    
    let sortedVideos = [...videos];
    
    if (mostViewedChannels?.length) {
      sortedVideos.sort((a, b) => {
        const aIndex = mostViewedChannels.indexOf(a.channel_id);
        const bIndex = mostViewedChannels.indexOf(b.channel_id);
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    }

    return sortedVideos;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const featuredVideos = getFeaturedVideos();
      setCurrentIndex((prevIndex) => 
        prevIndex + 2 >= featuredVideos.length ? 0 : prevIndex + 2
      );
    }, 60000);

    return () => clearInterval(interval);
  }, [videos, mostViewedChannels]);

  const featuredVideos = getFeaturedVideos();
  if (!featuredVideos.length) return null;

  const displayedVideos = featuredVideos.slice(currentIndex, currentIndex + 2);

  return (
    <div className="w-full max-w-[1800px] mx-auto px-4 mb-12 mt-24">
      <h2 className="text-2xl font-bold mb-8 text-accent">
        {session?.user ? "Recommended Videos" : "Featured Videos"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {displayedVideos.map((video) => (
          <div 
            key={video.id} 
            onClick={() => onVideoClick(video.id)} 
            className="w-full transition-all duration-500 ease-in-out"
          >
            <VideoCard {...video} />
          </div>
        ))}
      </div>
    </div>
  );
};