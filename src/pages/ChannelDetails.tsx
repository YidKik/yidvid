import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Youtube, ChevronDown, ChevronUp } from "lucide-react";
import { VideoCard } from "@/components/VideoCard";
import { BackButton } from "@/components/navigation/BackButton";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

const ChannelDetails = () => {
  const { id: channelId } = useParams();
  const [showDescription, setShowDescription] = useState(false);

  const { data: channel, isLoading: isLoadingChannel } = useQuery({
    queryKey: ["channel", channelId],
    queryFn: async () => {
      if (!channelId) {
        throw new Error("Channel ID is required");
      }

      let retries = 0;
      let lastError;

      while (retries < MAX_RETRIES) {
        try {
          const { data, error } = await supabase
            .from("youtube_channels")
            .select("*")
            .eq("channel_id", decodeURIComponent(channelId))
            .maybeSingle();

          if (error) {
            console.error("Error fetching channel:", error);
            throw error;
          }

          if (!data) {
            toast.error("Channel not found");
            throw new Error("Channel not found");
          }

          return data;
        } catch (error) {
          lastError = error;
          retries++;
          if (retries < MAX_RETRIES) {
            await new Promise(resolve => 
              setTimeout(resolve, INITIAL_RETRY_DELAY * Math.pow(2, retries - 1))
            );
          }
        }
      }

      console.error("Final error in channel fetch:", lastError);
      toast.error("Failed to load channel. Please try again later.");
      throw lastError;
    },
    retry: false,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  const { data: videos, isLoading: isLoadingVideos, refetch } = useQuery({
    queryKey: ["channel-videos", channelId],
    queryFn: async () => {
      if (!channelId) {
        throw new Error("Channel ID is required");
      }

      let retries = 0;
      let lastError;

      while (retries < MAX_RETRIES) {
        try {
          const { data, error } = await supabase
            .from("youtube_videos")
            .select("*")
            .eq("channel_id", decodeURIComponent(channelId))
            .order("uploaded_at", { ascending: false });

          if (error) {
            console.error("Error fetching videos:", error);
            throw error;
          }

          return data || [];
        } catch (error) {
          lastError = error;
          retries++;
          if (retries < MAX_RETRIES) {
            await new Promise(resolve => 
              setTimeout(resolve, INITIAL_RETRY_DELAY * Math.pow(2, retries - 1))
            );
          }
        }
      }

      console.error("Final error in videos fetch:", lastError);
      toast.error("Failed to load videos. Please try again later.");
      throw lastError;
    },
    retry: false,
    enabled: !!channel,
  });

  // Set up realtime subscription for video updates
  useEffect(() => {
    if (!channelId) return;

    const channel = supabase
      .channel('channel_videos_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'youtube_videos',
          filter: `channel_id=eq.${decodeURIComponent(channelId)}`
        },
        (payload) => {
          console.log('Realtime update:', payload);
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, refetch]);

  if (isLoadingChannel || isLoadingVideos) {
    return (
      <div className="container mx-auto p-4 mt-16">
        <BackButton />
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="container mx-auto p-4 mt-16">
        <BackButton />
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-lg text-destructive">Channel not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 mt-16">
      <BackButton />
      <div className="flex flex-col items-center mb-8">
        <Avatar className="w-32 h-32 mb-4">
          <AvatarImage
            src={channel.thumbnail_url}
            alt={channel.title}
            className="object-cover"
          />
          <AvatarFallback className="bg-primary/10">
            <Youtube className="w-16 h-16 text-primary" />
          </AvatarFallback>
        </Avatar>
        <h1 className="text-3xl font-bold text-center mb-2">{channel.title}</h1>
        {channel.description && (
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDescription(!showDescription)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showDescription ? (
                <span className="flex items-center gap-1">
                  Less <ChevronUp className="h-3 w-3" />
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  More <ChevronDown className="h-3 w-3" />
                </span>
              )}
            </Button>
            {showDescription && (
              <p className="text-muted-foreground text-sm text-center max-w-2xl mt-2 animate-fade-in">
                {channel.description}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
        {videos?.map((video) => (
          <VideoCard
            key={video.id}
            id={video.id}
            title={video.title}
            thumbnail={video.thumbnail}
            channelName={video.channel_name}
            views={video.views || 0}
            uploadedAt={new Date(video.uploaded_at)}
            channelId={video.channel_id}
            channelThumbnail={channel.thumbnail_url}
          />
        ))}
      </div>
    </div>
  );
};

export default ChannelDetails;