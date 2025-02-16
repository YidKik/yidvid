import { ThumbsUp, UserPlus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useChannelSubscription } from "@/hooks/channel/useChannelSubscription";
import { LikeAnimation } from "./LikeAnimation";

interface VideoInteractionsProps {
  videoId: string;
}

type InteractionType = 'view' | 'like' | 'dislike' | 'save';

export const VideoInteractions = ({ videoId }: VideoInteractionsProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [channelId, setChannelId] = useState<string | null>(null);

  useEffect(() => {
    const fetchChannelId = async () => {
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

  const { isSubscribed, handleSubscribe } = useChannelSubscription(channelId);

  const handleLike = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like videos",
        variant: "destructive",
      });
      return;
    }

    try {
      const interactionData = {
        user_id: session.user.id,
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
      toast({
        title: "Success",
        description: "Video liked successfully",
      });
    } catch (error) {
      console.error('Error liking video:', error);
      toast({
        title: "Error",
        description: "Failed to like the video",
        variant: "destructive",
      });
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
          className={`group relative rounded-full p-2 md:p-3 hover:bg-gray-100 transition-all duration-300 ${
            isLiked 
              ? "bg-gray-50 border-gray-200 hover:border-gray-300" 
              : "hover:border-gray-300"
          }`}
        >
          <ThumbsUp 
            className={`w-5 h-5 md:w-6 md:h-6 transition-all duration-300 ${
              isLiked 
                ? "text-black fill-black" 
                : "group-hover:text-gray-700"
            }`}
          />
          <span className={`absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium transition-opacity duration-200 ${
            isLiked ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}>
            {isLiked ? "Liked" : "Like"}
          </span>
        </Button>
        
        <Button
          variant={isSubscribed ? "default" : "outline"}
          onClick={handleSubscribe}
          className={`w-24 md:w-32 h-8 md:h-10 text-xs md:text-sm transition-all duration-200 ${
            isSubscribed ? "bg-primary hover:bg-primary-hover text-white shadow-md" : ""
          }`}
        >
          {isSubscribed ? (
            <>
              <Check className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 animate-in" />
              Subscribed
            </>
          ) : (
            <>
              <UserPlus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              Subscribe
            </>
          )}
        </Button>
      </div>
    </>
  );
};
