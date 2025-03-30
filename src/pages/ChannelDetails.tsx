
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { BackButton } from "@/components/navigation/BackButton";
import { ChannelLoading } from "@/components/channel/ChannelLoading";
import { ChannelHeader } from "@/components/channel/ChannelHeader";
import { ChannelVideos } from "@/components/channel/ChannelVideos";
import { useChannelData } from "@/hooks/channel/useChannelData";
import { useChannelSubscription } from "@/hooks/channel/useChannelSubscription";
import { useChannelVideos } from "@/hooks/channel/useChannelVideos";
import { Button } from "@/components/ui/button";
import { VideoPlaceholder } from "@/components/video/VideoPlaceholder";
import { toast } from "sonner";

const ChannelDetails = () => {
  const { id: channelId } = useParams();
  const navigate = useNavigate();
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const { 
    data: channel, 
    isLoading: isLoadingChannel, 
    error: channelError,
    refetch: refetchChannel
  } = useChannelData(channelId);
  
  const { isSubscribed, handleSubscribe } = useChannelSubscription(channelId);
  
  const { 
    displayedVideos, 
    isLoadingInitialVideos, 
    isLoadingMore, 
    INITIAL_VIDEOS_COUNT 
  } = useChannelVideos(channelId);

  // Handle retry logic for failed channel loads
  useEffect(() => {
    if (channelError && loadAttempts < 2) {
      const timer = setTimeout(() => {
        setLoadAttempts(prev => prev + 1);
        setIsRetrying(true);
        refetchChannel().finally(() => {
          setIsRetrying(false);
        });
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [channelError, loadAttempts, refetchChannel]);

  // Handle navigation from failed channel load
  const handleGoHome = () => {
    navigate('/');
  };

  const handleRetryLoad = () => {
    setIsRetrying(true);
    refetchChannel()
      .then(() => {
        toast.success("Channel reloaded successfully");
      })
      .catch(() => {
        toast.error("Failed to load channel");
      })
      .finally(() => {
        setIsRetrying(false);
      });
  };

  if (isLoadingChannel || isRetrying) {
    return <ChannelLoading />;
  }

  if (!channel || channelError) {
    return (
      <div className="container mx-auto p-4 mt-16">
        <BackButton />
        <div className="flex flex-col items-center justify-center min-h-[300px] p-6 border border-gray-200 rounded-lg bg-white/50 shadow-sm">
          <VideoPlaceholder size="medium" />
          <h2 className="text-xl font-semibold text-destructive mt-6">Channel not found</h2>
          <p className="text-muted-foreground mt-2 text-center max-w-md">
            The channel could not be loaded. It may have been removed or there might be a temporary issue.
          </p>
          <div className="flex gap-4 mt-6">
            <Button onClick={handleGoHome} variant="default">
              Return Home
            </Button>
            <Button onClick={handleRetryLoad} variant="outline" disabled={isRetrying}>
              Try Again
            </Button>
          </div>
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
