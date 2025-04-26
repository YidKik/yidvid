import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
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
import { useSessionManager } from "@/hooks/useSessionManager";

const ChannelDetails = () => {
  const { channelId } = useParams<{ channelId?: string }>();
  const cleanChannelId = channelId?.trim() || "";
  const navigate = useNavigate();
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const { isAuthenticated } = useSessionManager();
  
  console.log("ChannelDetails rendering with channelId:", cleanChannelId, "isAuthenticated:", isAuthenticated);
  
  // Exit early if no channelId is provided at all
  useEffect(() => {
    if (!cleanChannelId) {
      console.error("No channel ID found in URL parameters");
      toast.error("Channel ID is required");
      navigate('/');
    }
  }, [cleanChannelId, navigate]);
  
  const { 
    data: channel, 
    isLoading: isLoadingChannel, 
    error: channelError,
    refetch: refetchChannel
  } = useChannelData(cleanChannelId);
  
  const { 
    isSubscribed, 
    handleSubscribe, 
    isLoading: isLoadingSubscription,
    checkSubscription
  } = useChannelSubscription(cleanChannelId);
  
  // Only initialize video hooks if we have a valid channel ID
  const { 
    displayedVideos, 
    isLoadingInitialVideos, 
    isLoadingMore, 
    INITIAL_VIDEOS_COUNT,
    refetchVideos,
    error: videosError
  } = useChannelVideos(cleanChannelId);
  
  // Double-check subscription status when component mounts
  useEffect(() => {
    if (isAuthenticated && cleanChannelId && checkSubscription) {
      console.log("Double-checking subscription status on component mount");
      checkSubscription().then(status => {
        console.log("Initial subscription status check:", status);
      });
    }
  }, [isAuthenticated, cleanChannelId, checkSubscription]);

  // Effect to recheck subscription status periodically
  useEffect(() => {
    if (!isAuthenticated || !checkSubscription) return;
    
    const interval = setInterval(() => {
      checkSubscription().then(status => {
        console.log(`Periodic subscription check: ${status ? 'Subscribed' : 'Not Subscribed'}`);
      });
    }, 10000); // Every 10 seconds
    
    return () => clearInterval(interval);
  }, [isAuthenticated, checkSubscription]);

  useEffect(() => {
    // Log channel information for debugging
    if (channel) {
      console.log("Channel data loaded successfully:", channel);
    }
    
    if (channelError) {
      console.error("Channel error details:", channelError);
    }
  }, [channel, channelError]);

  // Handle retry logic for failed channel loads
  useEffect(() => {
    if (channelError && loadAttempts < 3 && cleanChannelId) {
      const timer = setTimeout(() => {
        console.log(`Retry attempt ${loadAttempts + 1} for channel:`, cleanChannelId);
        setLoadAttempts(prev => prev + 1);
        setIsRetrying(true);
        refetchChannel().finally(() => {
          setIsRetrying(false);
        });
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [channelError, loadAttempts, refetchChannel, cleanChannelId]);

  // Handle navigation from failed channel load
  const handleGoHome = () => {
    navigate('/');
  };

  const handleRetryLoad = () => {
    if (!cleanChannelId) {
      toast.error("Cannot retry: Missing channel ID");
      return;
    }
    
    setIsRetrying(true);
    Promise.all([refetchChannel(), refetchVideos()])
      .then(() => {
        toast.success("Channel reloaded successfully");
      })
      .catch((error) => {
        console.error("Retry failed:", error);
        toast.error("Failed to load channel");
      })
      .finally(() => {
        setIsRetrying(false);
      });
  };
  
  // Handle the subscribe action with verification
  const handleSubscribeAction = useCallback(async () => {
    console.log("Subscribe action triggered");
    await handleSubscribe();
  }, [handleSubscribe]);

  // Return early if no channelId is provided
  if (!cleanChannelId) {
    return (
      <div className="container mx-auto p-4 mt-16">
        <BackButton />
        <div className="flex flex-col items-center justify-center min-h-[300px] p-6 border border-gray-200 rounded-lg bg-white/50 shadow-sm">
          <VideoPlaceholder size="medium" />
          <h2 className="text-xl font-semibold text-destructive mt-6">Missing Channel ID</h2>
          <p className="text-muted-foreground mt-2 text-center max-w-md">
            No channel identifier was provided in the URL.
          </p>
          <div className="flex gap-4 mt-6">
            <Button onClick={handleGoHome} variant="default">
              Return Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
            {channelError?.message || "The channel could not be loaded. It may have been removed or there might be a temporary issue."}
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

  // Check if videos data is loading or has errors
  const isLoadingVideos = isLoadingInitialVideos;
  const hasVideosError = !!videosError;
  const noVideosFound = !isLoadingVideos && !hasVideosError && (!displayedVideos || displayedVideos.length === 0);

  return (
    <div className="container mx-auto p-4 mt-16 opacity-0 animate-[fadeIn_0.6s_ease-out_forwards]">
      <BackButton />
      <ChannelHeader
        channel={channel}
        isSubscribed={isSubscribed}
        onSubscribe={handleSubscribeAction}
        isLoading={isLoadingSubscription}
      />
      
      {hasVideosError ? (
        <div className="text-center my-12 p-6 border border-gray-100 rounded-lg bg-white/50">
          <VideoPlaceholder size="small" />
          <h3 className="text-lg font-medium mt-4">Error loading videos</h3>
          <p className="text-muted-foreground mt-2">
            {videosError instanceof Error ? videosError.message : "There was an error loading videos for this channel."}
          </p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={refetchVideos}
          >
            Retry
          </Button>
        </div>
      ) : noVideosFound ? (
        <div className="text-center my-12 p-6 border border-gray-100 rounded-lg bg-white/50">
          <VideoPlaceholder size="small" />
          <h3 className="text-lg font-medium mt-4">No videos found</h3>
          <p className="text-muted-foreground mt-2">
            This channel doesn't have any videos yet, or they're still being processed.
          </p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={refetchVideos}
          >
            Refresh Videos
          </Button>
        </div>
      ) : (
        <ChannelVideos
          videos={displayedVideos || []}
          isLoading={isLoadingVideos}
          channelThumbnail={channel.thumbnail_url}
          initialCount={INITIAL_VIDEOS_COUNT}
          isLoadingMore={isLoadingMore}
        />
      )}
    </div>
  );
};

export default ChannelDetails;
