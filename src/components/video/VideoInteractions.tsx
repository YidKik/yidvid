
import { ThumbsUp, UserPlus, Check, Loader2 } from "lucide-react";
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
  const [channelId, setChannelId] = useState<string | null>(null);
  const { session } = useSessionManager();
  const userId = session?.user?.id;

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
    if (!userId) {
      toast.error("Please sign in to like videos");
      return;
    }

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
        throw error;
      }

      setIsLiked(true);
      setShowAnimation(true);
      toast.success("Video liked successfully");
    } catch (error) {
      console.error('Error liking video:', error);
      toast.error("Failed to like the video");
    }
  };

  return (
    <>
      <LikeAnimation 
        isVisible={showAnimation} 
        onComplete={() => setShowAnimation(false)} 
      />
      <div className="flex gap-2 md:gap-4 mb-4 md:mb-8">
        <Button
          variant="outline"
          onClick={handleLike}
          className={`group relative rounded-full p-2 md:p-3 hover:bg-primary/10 transition-all duration-300 ${
            isLiked 
              ? "bg-primary border-primary hover:bg-primary/90" 
              : "hover:border-gray-300"
          }`}
        >
          <ThumbsUp 
            className={`w-5 h-5 md:w-6 md:h-6 transition-all duration-300 ${
              isLiked 
                ? "text-white fill-white" 
                : "group-hover:text-primary"
            }`}
          />
          <span className={`absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium transition-opacity duration-200 ${
            isLiked ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}>
            {isLiked ? "Liked" : "Like"}
          </span>
        </Button>
        
        {channelId && (
          <Button
            variant={isSubscribed ? "default" : "outline"}
            onClick={handleSubscribe}
            disabled={isLoadingSubscription}
            className={`relative group rounded-full px-6 py-2 text-xs md:text-sm transition-all duration-300
              ${isSubscribed 
                ? "bg-primary border-primary hover:bg-primary/90 text-white shadow-md" 
                : "hover:bg-primary/10 hover:border-gray-300"
              }
            `}
          >
            {isLoadingSubscription ? (
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
