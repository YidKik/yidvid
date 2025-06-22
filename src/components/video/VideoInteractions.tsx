
import { ThumbsUp, UserPlus, Check, Loader2, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEnhancedChannelSubscription } from "@/hooks/channel/useEnhancedChannelSubscription";
import { LikeAnimation } from "./LikeAnimation";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";

interface VideoInteractionsProps {
  videoId: string;
}

type InteractionType = 'view' | 'like' | 'dislike' | 'save';

export const VideoInteractions = ({ videoId }: VideoInteractionsProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [isClickAnimating, setIsClickAnimating] = useState(false);
  const [channelId, setChannelId] = useState<string | null>(null);
  const [channelName, setChannelName] = useState<string>("");
  
  const { isAuthenticated, user, isLoading: authLoading, isProfileLoading } = useUnifiedAuth();
  const userId = user?.id;

  // Get subscription state for this channel
  const {
    isSubscribed,
    isLoading: subscriptionLoading,
    handleSubscribe,
    error: subscriptionError,
    isUserDataReady
  } = useEnhancedChannelSubscription(channelId || undefined);

  console.log("VideoInteractions state:", {
    videoId,
    channelId,
    isAuthenticated,
    userId,
    isUserDataReady,
    isSubscribed,
    subscriptionLoading,
    authLoading,
    isProfileLoading
  });

  // Fetch channel info
  useEffect(() => {
    const fetchChannelInfo = async () => {
      if (!videoId) return;

      try {
        const { data, error } = await supabase
          .from('youtube_videos')
          .select('channel_id, channel_name')
          .eq('id', videoId)
          .single();

        if (error) {
          console.error('Error fetching channel info:', error);
          return;
        }

        console.log("Channel info fetched:", data);
        setChannelId(data.channel_id);
        setChannelName(data.channel_name || "");
      } catch (err) {
        console.error("Unexpected error fetching channel info:", err);
      }
    };

    fetchChannelInfo();
  }, [videoId]);

  const handleLike = async () => {
    console.log("Like button clicked!", { isAuthenticated, userId, videoId });
    
    setIsClickAnimating(true);
    setTimeout(() => setIsClickAnimating(false), 2000);
    
    setIsLiked(true);
    
    if (isAuthenticated && userId) {
      try {
        const interactionData = {
          user_id: userId,
          video_id: videoId,
          interaction_type: 'like' as InteractionType
        };

        const { error } = await supabase
          .from('user_video_interactions')
          .insert(interactionData);

        if (error) {
          console.error('Error saving like:', error);
        }

        toast.success("Video liked successfully");
      } catch (error) {
        console.error('Error liking video:', error);
      }
    } else {
      toast.success("Video liked!");
    }
  };

  const handleShare = async () => {
    const baseUrl = window.location.origin;
    const shortUrl = `${baseUrl}/video/${videoId}`;
    
    try {
      await navigator.clipboard.writeText(shortUrl);
      toast.success("Link copied to clipboard!");
      
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          url: shortUrl,
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.success("Link copied to clipboard!");
    }
  };

  const isLoading = authLoading || isProfileLoading || subscriptionLoading;

  return (
    <>
      <div className="relative">
        <LikeAnimation 
          isVisible={showAnimation} 
          onComplete={() => setShowAnimation(false)} 
        />
      </div>
      <div className="flex gap-2 md:gap-4 mb-4 md:mb-8">
        <Button
          variant="outline"
          onClick={handleLike}
          className={`group relative rounded-full p-2 md:p-3 transition-all duration-300 active:scale-90 border ${
            isLiked 
              ? "bg-white border-red-500 hover:bg-gray-50" 
              : "bg-white border-gray-300 hover:bg-gray-50 hover:border-red-500"
          } ${isClickAnimating ? 'like-click-animation' : ''}`}
        >
          <ThumbsUp 
            className={`w-5 h-5 md:w-6 md:h-6 transition-all duration-300 stroke-2 ${
              isLiked 
                ? "text-red-500 fill-red-500 stroke-red-500" 
                : "text-gray-600 group-hover:text-red-500 group-hover:stroke-red-500 group-hover:scale-110"
            }`}
          />
        </Button>

        <Button
          variant="outline"
          onClick={handleShare}
          className="group relative rounded-full p-2 md:p-3 transition-all duration-300 active:scale-90 border bg-white border-gray-300 hover:bg-gray-50 hover:border-red-500"
        >
          <Share className="w-5 h-5 md:w-6 md:h-6 transition-all duration-300 stroke-2 text-gray-600 group-hover:text-red-500 group-hover:stroke-red-500 group-hover:scale-110" />
        </Button>
        
        {channelId && (
          <>
            {isAuthenticated ? (
              <Button
                variant={isSubscribed ? "default" : "outline"}
                onClick={handleSubscribe}
                disabled={isLoading}
                className={`relative group rounded-full px-4 md:px-6 py-2 text-xs md:text-sm transition-all duration-300 active:scale-95 font-medium
                  ${isSubscribed 
                    ? "bg-red-500 border-red-500 hover:bg-red-600 text-white shadow-md" 
                    : "bg-white border-gray-300 hover:bg-gray-50 hover:border-red-500 text-gray-700 hover:text-red-500"
                  }
                `}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : isSubscribed ? (
                  <>
                    <Check className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    <span>Subscribed</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    <span>Subscribe</span>
                  </>
                )}
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => toast.info("Please sign in to subscribe to channels")}
                className="relative group rounded-full px-4 md:px-6 py-2 text-xs md:text-sm transition-all duration-300 active:scale-95 font-medium bg-white border-gray-300 hover:bg-gray-50 hover:border-red-500 text-gray-700 hover:text-red-500"
              >
                <UserPlus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span>Subscribe</span>
              </Button>
            )}
          </>
        )}
      </div>

      {subscriptionError && (
        <div className="text-red-500 text-sm mb-2">
          Error: {subscriptionError}
        </div>
      )}
    </>
  );
};
