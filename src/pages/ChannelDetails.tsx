import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Youtube } from "lucide-react";
import { VideoCard } from "@/components/VideoCard";
import { BackButton } from "@/components/navigation/BackButton";

const ChannelDetails = () => {
  const { channelId } = useParams();

  const { data: channel, isLoading: isLoadingChannel } = useQuery({
    queryKey: ["channel", channelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*")
        .eq("channel_id", channelId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: videos, isLoading: isLoadingVideos } = useQuery({
    queryKey: ["channel-videos", channelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .eq("channel_id", channelId)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoadingChannel || isLoadingVideos) {
    return <div className="p-8">Loading...</div>;
  }

  if (!channel) {
    return <div className="p-8">Channel not found</div>;
  }

  return (
    <div className="container mx-auto p-4 mt-16">
      <BackButton />
      <div className="flex flex-col items-center mb-8">
        {channel.thumbnail_url ? (
          <img
            src={channel.thumbnail_url}
            alt={channel.title}
            className="w-32 h-32 rounded-full mb-4 object-cover"
          />
        ) : (
          <div className="w-32 h-32 rounded-full mb-4 bg-primary/10 flex items-center justify-center">
            <Youtube className="w-16 h-16 text-primary" />
          </div>
        )}
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
          />
        ))}
      </div>
    </div>
  );
};

export default ChannelDetails;