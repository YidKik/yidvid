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
import { useHiddenChannels } from "@/hooks/channel/useHiddenChannels";
import { toast } from "sonner";
import { useSessionManager } from "@/hooks/useSessionManager";
import { EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoader } from "@/contexts/LoadingContext";

const ChannelDetails = () => {
  const { channelId } = useParams<{ channelId?: string }>();
  const cleanChannelId = channelId?.trim() || "";
  const navigate = useNavigate();
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const { isAuthenticated, session, refreshSession } = useSessionManager();
  const { isChannelHidden, unhideChannel } = useHiddenChannels();
  
  // Check if channel is hidden by the user
  const isHidden = cleanChannelId ? isChannelHidden(cleanChannelId) : false;
  
  // Exit early if no channelId is provided
  useEffect(() => {
    if (!cleanChannelId) {
      console.error("No channel ID found in URL parameters");
      toast.error("Channel ID is required");
      navigate('/');
    }
  }, [cleanChannelId, navigate]);

  // Ensure we have a fresh session for subscription checks
  useEffect(() => {
    const ensureFreshSession = async () => {
      if (isAuthenticated) {
        try {
          await refreshSession();
        } catch (error) {
          console.error("Failed to refresh session:", error);
        }
      }
    };
    
    ensureFreshSession();
  }, [isAuthenticated, refreshSession]);
  
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

  // Register loading state with the global loading bar
  const isLoading = isLoadingChannel || isLoadingInitialVideos;
  usePageLoader('channel', isLoading);

  // Verify subscription status when component mounts or auth state changes
  useEffect(() => {
    if (isAuthenticated && cleanChannelId && checkSubscription && session?.user?.id) {
      const timer = setTimeout(() => {
        checkSubscription();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, cleanChannelId, checkSubscription, session?.user?.id]);

  // Effect to verify subscription status periodically
  useEffect(() => {
    if (!isAuthenticated || !checkSubscription || !session?.user?.id) return;
    
    const firstCheck = setTimeout(() => {
      checkSubscription();
    }, 2000);
    
    const interval = setInterval(() => {
      checkSubscription();
    }, 30000);
    
    return () => {
      clearTimeout(firstCheck);
      clearInterval(interval);
    };
  }, [isAuthenticated, checkSubscription, session?.user?.id]);

  // Handle retry logic for failed channel loads
  useEffect(() => {
    if (channelError && loadAttempts < 3 && cleanChannelId) {
      const timer = setTimeout(() => {
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

  const handleUnhideChannel = async () => {
    const success = await unhideChannel(cleanChannelId);
    if (success) {
      toast.success("Channel is now visible");
    }
  };

  // Only show missing channel ID error if there's no channel ID
  if (!cleanChannelId) {
    return <ChannelErrorState 
      error={new Error("Missing Channel ID")} 
      onRetry={handleRetryLoad}
      onGoHome={() => navigate('/')}
      isRetrying={isRetrying}
    />;
  }

  // Show hidden channel message if user has hidden this channel
  if (isHidden && isAuthenticated) {
    return (
      <div className="w-full min-h-screen bg-white text-black pt-14 pl-0 lg:pl-[200px] pb-20 lg:pb-0 transition-all duration-300">
        <div className="p-4 lg:p-6">
          <BackButton />
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <EyeOff className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Channel Hidden</h2>
            <p className="text-gray-600 mb-6 max-w-md">
              You've hidden this channel from your feed. Videos from this channel won't appear in your recommendations.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Go Back
              </Button>
              <Button
                onClick={handleUnhideChannel}
                className="bg-primary hover:bg-primary/90"
              >
                Show Channel
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state for both channel and initial loading of videos
  if (isLoadingChannel || isRetrying) {
    return <ChannelLoading />;
  }

  // Only show channel error if we truly have no channel data
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
    <div className="w-full min-h-screen bg-white text-black pt-14 pl-0 lg:pl-[200px] pb-20 lg:pb-0 transition-all duration-300">
      <div className="p-4 lg:p-6">
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
    </div>
  );
};

export default ChannelDetails;
