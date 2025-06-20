
import { ThumbsUp, UserPlus, Check, Loader2, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useChannelSubscription } from "@/hooks/channel/useChannelSubscription";
import { LikeAnimation } from "./LikeAnimation";
import { useSessionManager } from "@/hooks/useSessionManager";

interface VideoInteractionsProps {
  videoId: string;
}

type InteractionType = 'view' | 'like' | 'dislike' | 'save';

export const VideoInteractions = ({ videoId }: VideoInteractionsProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [isClickAnimating, setIsClickAnimating] = useState(false);
  const [channelId, setChannelId] = useState<string | null>(null);
  const { session, isAuthenticated, isLoading: isSessionLoading } = useSessionManager();
  const userId = session?.user?.id;

  // Debug logging for authentication state
  useEffect(() => {
    console.log("VideoInteractions auth state:", { 
      isAuthenticated, 
      isSessionLoading,
      hasSession: !!session, 
      userId,
      userObj: session?.user
    });
  }, [session, isAuthenticated, isSessionLoading, userId]);

  useEffect(() => {
    const fetchChannelId = async () => {
      if (!videoId) return;

      const { data, error } = await supabase
        .from('youtube_videos')
        .select('channel_id')
        .eq('id', videoId)
        .single();

      if (error) {
        console.error('Error fetching channel ID:', error);
        return;
      }

      setChannelId(data.channel_id);
    };

    fetchChannelId();
  }, [videoId]);

  const { 
    isSubscribed, 
    handleSubscribe, 
    isLoading: isLoadingSubscription 
  } = useChannelSubscription(channelId || undefined);

  const handleLike = async () => {
    console.log("Like button clicked!", { isAuthenticated, userId, videoId });
    
    // Trigger click animation
    setIsClickAnimating(true);
    setTimeout(() => setIsClickAnimating(false), 2000);
    
    // Don't show floating animation anymore
    // setShowAnimation(true);
    
    // Allow all users to like videos (no authentication required)
    setIsLiked(true);
    
    // If user is authenticated, save to database
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
          console.error('Error details:', error);
          // Don't throw error, just log it - user can still see the like effect
        }

        toast.success("Video liked successfully");
      } catch (error) {
        console.error('Error liking video:', error);
        // Don't show error toast - user experience should remain smooth
      }
    } else {
      // Show success message even for non-authenticated users
      toast.success("Video liked!");
    }
  };

  const handleShare = async () => {
    const currentUrl = window.location.href;
    
    try {
      // Copy to clipboard
      await navigator.clipboard.writeText(currentUrl);
      toast.success("Link copied to clipboard!");
      
      // Try to use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          url: currentUrl,
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback: just copy to clipboard (already done above)
      toast.success("Link copied to clipboard!");
    }
  };

  // Determine if we should disable buttons due to auth loading
  const isAuthLoading = isSessionLoading;
  const buttonDisabled = isLoadingSubscription || isAuthLoading;

  const handleSubscribeClick = async () => {
    try {
      if (isAuthLoading) {
        toast.info("Please wait while we verify your account");
        return;
      }
      
      if (!isAuthenticated) {
        toast.error("Please sign in to subscribe");
        return;
      }
      
      await handleSubscribe();
    } catch (error) {
      console.error("Subscribe error:", error);
      // Error is already handled in handleSubscribe
    }
  };

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
          disabled={false} // Never disable the like button
          className={`group relative rounded-full p-2 md:p-3 transition-all duration-300 active:scale-90 border-2 ${
            isLiked 
              ? "bg-white border-red-500 hover:bg-gray-50" 
              : "bg-white border-black hover:bg-gray-50 hover:border-red-500"
          } ${isClickAnimating ? 'like-click-animation' : ''}`}
        >
          <ThumbsUp 
            className={`w-5 h-5 md:w-6 md:h-6 transition-all duration-300 stroke-2 ${
              isLiked 
                ? "text-red-500 fill-red-500 stroke-red-500" 
                : "text-gray-600 group-hover:text-red-500 group-hover:stroke-red-500 group-hover:scale-110"
            }`}
          />
          <span className={`absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium transition-opacity duration-200 ${
            isLiked ? "opacity-100 text-red-500" : "opacity-0 group-hover:opacity-100"
          }`}>
            {isLiked ? "Liked" : "Like"}
          </span>
        </Button>

        <Button
          variant="outline"
          onClick={handleShare}
          className="group relative rounded-full p-2 md:p-3 transition-all duration-300 active:scale-90 border-2 bg-white border-black hover:bg-gray-50 hover:border-blue-500"
        >
          <Share 
            className="w-5 h-5 md:w-6 md:h-6 transition-all duration-300 stroke-2 text-gray-600 group-hover:text-blue-500 group-hover:stroke-blue-500 group-hover:scale-110"
          />
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Share
          </span>
        </Button>
        
        {channelId && (
          <Button
            variant={isSubscribed ? "default" : "outline"}
            onClick={handleSubscribeClick}
            disabled={buttonDisabled}
            className={`relative group rounded-full px-6 py-2 text-xs md:text-sm transition-all duration-300 active:scale-95
              ${isSubscribed 
                ? "bg-primary border-primary hover:bg-primary/90 text-white shadow-md" 
                : "hover:bg-primary/10 hover:border-gray-300"
              }
            `}
          >
            {isLoadingSubscription || isAuthLoading ? (
              <>
                <Loader2 className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 animate-spin" />
                <span>Loading...</span>
              </>
            ) : isSubscribed ? (
              <>
                <Check className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 animate-in" />
                <span>Subscribed</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span>Subscribe</span>
              </>
            )}
            <span className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
              {isSubscribed ? "Subscribed" : "Subscribe to channel"}
            </span>
          </Button>
        )}
      </div>
    </>
  );
};
