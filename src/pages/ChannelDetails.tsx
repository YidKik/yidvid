import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Youtube } from "lucide-react";
import { VideoCard } from "@/components/VideoCard";
import { BackButton } from "@/components/navigation/BackButton";
import { toast } from "sonner";
import { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ChannelDetails = () => {
  const { id: channelId } = useParams();

  const { data: channel, isLoading: isLoadingChannel } = useQuery({
    queryKey: ["channel", channelId],
    queryFn: async () => {
      if (!channelId) {
        throw new Error("Channel ID is required");
      }

      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*")
        .eq("channel_id", channelId)
        .single();

      if (error) {
        console.error("Error fetching channel:", error);
        toast.error("Failed to load channel details");
        throw error;
      }

      return data;
    },
  });

  const { data: videos, isLoading: isLoadingVideos, refetch } = useQuery({
    queryKey: ["channel-videos", channelId],
    queryFn: async () => {
      if (!channelId) {
        throw new Error("Channel ID is required");
      }

      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .eq("channel_id", channelId)
        .order("uploaded_at", { ascending: false });

      if (error) {
        console.error("Error fetching videos:", error);
        toast.error("Failed to load channel videos");
        throw error;
      }

      return data || [];
    },
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
          filter: `channel_id=eq.${channelId}`
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
          <p className="text-muted-foreground text-center max-w-2xl">
            {channel.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
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
          />
        ))}
      </div>
    </div>
  );
};

export default ChannelDetails;