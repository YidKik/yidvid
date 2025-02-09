
import { useParams } from "react-router-dom";
import { BackButton } from "@/components/navigation/BackButton";
import { ChannelLoading } from "@/components/channel/ChannelLoading";
import { ChannelHeader } from "@/components/channel/ChannelHeader";
import { ChannelVideos } from "@/components/channel/ChannelVideos";
import { useChannelData } from "@/hooks/channel/useChannelData";
import { useChannelSubscription } from "@/hooks/channel/useChannelSubscription";
import { useChannelVideos } from "@/hooks/channel/useChannelVideos";

const ChannelDetails = () => {
  const { id: channelId } = useParams();
  
  const { data: channel, isLoading: isLoadingChannel } = useChannelData(channelId);
  const { isSubscribed, handleSubscribe } = useChannelSubscription(channelId);
  const { 
    displayedVideos, 
    isLoadingInitialVideos, 
    isLoadingMore, 
    INITIAL_VIDEOS_COUNT 
  } = useChannelVideos(channelId);

  if (isLoadingChannel) {
    return <ChannelLoading />;
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
    <div className="container mx-auto p-4 mt-16 opacity-0 animate-[fadeIn_0.6s_ease-out_forwards]">
      <BackButton />
      <ChannelHeader
        channel={channel}
        isSubscribed={isSubscribed}
        onSubscribe={handleSubscribe}
      />
      <ChannelVideos
        videos={displayedVideos}
        isLoading={isLoadingInitialVideos}
        channelThumbnail={channel.thumbnail_url}
        initialCount={INITIAL_VIDEOS_COUNT}
        isLoadingMore={isLoadingMore}
      />
    </div>
  );
};

export default ChannelDetails;
