
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { BackButton } from "@/components/navigation/BackButton";
import { ChannelLoading } from "@/components/channel/ChannelLoading";
import { ChannelHeader } from "@/components/channel/ChannelHeader";
import { ChannelErrorState } from "@/components/channel/ChannelErrorState";
import { ChannelVideoSection } from "@/components/channel/ChannelVideoSection";
import { useChannelData } from "@/hooks/channel/useChannelData";
import { useChannelSubscription } from "@/hooks/channel/useChannelSubscription";
import { useChannelVideos } from "@/hooks/channel/useChannelVideos";
import { toast } from "sonner";
import { useSessionManager } from "@/hooks/useSessionManager";

const ChannelDetails = () => {
  const { channelId } = useParams<{ channelId?: string }>();
  const cleanChannelId = channelId?.trim() || "";
  const navigate = useNavigate();
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const { isAuthenticated, session } = useSessionManager();
  
  // Exit early if no channelId is provided
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
  
  const { 
    displayedVideos, 
    isLoadingInitialVideos, 
    isLoadingMore, 
    INITIAL_VIDEOS_COUNT,
    refetchVideos,
    error: videosError
  } = useChannelVideos(cleanChannelId);

  // Verify subscription status when component mounts or auth state changes
  useEffect(() => {
    if (isAuthenticated && cleanChannelId && checkSubscription && session?.user?.id) {
      console.log("Verifying subscription status on channel page mount/auth change");
      checkSubscription().then(status => {
        console.log("Channel page subscription verification:", status ? 'Subscribed' : 'Not subscribed');
      });
    }
  }, [isAuthenticated, cleanChannelId, checkSubscription, session?.user?.id]);

  // Effect to verify subscription status periodically
  useEffect(() => {
    if (!isAuthenticated || !checkSubscription || !session?.user?.id) return;
    
    // First check after a short delay
    const firstCheck = setTimeout(() => {
      checkSubscription();
    }, 2000);
    
    // Regular interval check
    const interval = setInterval(() => {
      checkSubscription().then(status => {
        console.log(`Periodic subscription check: ${status ? 'Subscribed' : 'Not Subscribed'}`);
      });
    }, 30000); // Every 30 seconds
    
    return () => {
      clearTimeout(firstCheck);
      clearInterval(interval);
    };
  }, [isAuthenticated, checkSubscription, session?.user?.id]);

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

  if (!cleanChannelId) {
    return <ChannelErrorState 
      error={new Error("Missing Channel ID")} 
      onRetry={handleRetryLoad}
      onGoHome={() => navigate('/')}
      isRetrying={isRetrying}
    />;
  }

  if (isLoadingChannel || isRetrying) {
    return <ChannelLoading />;
  }

  if (!channel || channelError) {
    return <ChannelErrorState 
      error={channelError}
      onRetry={handleRetryLoad}
      onGoHome={() => navigate('/')}
      isRetrying={isRetrying}
    />;
  }

  const isLoadingVideos = isLoadingInitialVideos;
  const hasVideosError = !!videosError;

  return (
    <div className="container mx-auto p-4 mt-16 opacity-0 animate-[fadeIn_0.6s_ease-out_forwards]">
      <BackButton />
      <ChannelHeader
        channel={channel}
        isSubscribed={isSubscribed}
        onSubscribe={handleSubscribe}
        isLoading={isLoadingSubscription}
      />
      
      <ChannelVideoSection
        isLoadingVideos={isLoadingVideos}
        hasVideosError={hasVideosError}
        videosError={videosError}
        displayedVideos={displayedVideos || []}
        channelThumbnail={channel.thumbnail_url}
        INITIAL_VIDEOS_COUNT={INITIAL_VIDEOS_COUNT}
        isLoadingMore={isLoadingMore}
        refetchVideos={refetchVideos}
      />
    </div>
  );
};

export default ChannelDetails;
