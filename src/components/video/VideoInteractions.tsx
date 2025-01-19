import { ThumbsUp, UserPlus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface VideoInteractionsProps {
  videoId: string;
}

type InteractionType = 'view' | 'like' | 'dislike' | 'save';

export const VideoInteractions = ({ videoId }: VideoInteractionsProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

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

      console.log('Attempting to insert interaction:', interactionData);

      const { error } = await supabase
        .from('user_video_interactions')
        .insert(interactionData);

      if (error) {
        console.error('Error details:', error);
        throw error;
      }

      setIsLiked(true);
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

  const handleSubscribe = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe to channels",
        variant: "destructive",
      });
      return;
    }

    setIsSubscribed(true);
    toast({
      title: "Success",
      description: "Subscribed to channel",
    });
  };

  return (
    <div className="flex gap-4 mb-8">
      <Button
        variant={isLiked ? "default" : "outline"}
        onClick={handleLike}
        className={`w-32 transition-all duration-200 ${
          isLiked ? "bg-primary hover:bg-primary-hover text-white shadow-md" : ""
        }`}
      >
        <ThumbsUp className={`mr-2 ${isLiked ? "fill-current" : ""}`} />
        {isLiked ? "Liked" : "Like"}
      </Button>
      
      <Button
        variant={isSubscribed ? "default" : "outline"}
        onClick={handleSubscribe}
        className={`w-32 transition-all duration-200 ${
          isSubscribed ? "bg-primary hover:bg-primary-hover text-white shadow-md" : ""
        }`}
      >
        {isSubscribed ? (
          <>
            <Check className="mr-2 animate-in" />
            Subscribed
          </>
        ) : (
          <>
            <UserPlus className="mr-2" />
            Subscribe
          </>
        )}
      </Button>
    </div>
  );
};