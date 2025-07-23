import { ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";

interface DislikeButtonProps {
  videoId: string;
}

type InteractionType = 'view' | 'like' | 'dislike' | 'save';

export const DislikeButton = ({ videoId }: DislikeButtonProps) => {
  const [isDisliked, setIsDisliked] = useState(false);
  const [isClickAnimating, setIsClickAnimating] = useState(false);
  const { isAuthenticated, user } = useUnifiedAuth();
  const userId = user?.id;

  const handleDislike = async () => {
    console.log("Dislike button clicked!", { isAuthenticated, userId, videoId });
    
    setIsClickAnimating(true);
    setTimeout(() => setIsClickAnimating(false), 2000);
    
    setIsDisliked(true);
    
    if (isAuthenticated && userId) {
      try {
        const interactionData = {
          user_id: userId,
          video_id: videoId,
          interaction_type: 'dislike' as InteractionType
        };

        const { error } = await supabase
          .from('user_video_interactions')
          .insert(interactionData);

        if (error) {
          console.error('Error saving dislike:', error);
        }

        // No toast notification as requested
      } catch (error) {
        console.error('Error disliking video:', error);
      }
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleDislike}
      className={`group relative rounded-full p-2 md:p-3 transition-all duration-300 active:scale-90 border ${
        isDisliked 
          ? "bg-white border-red-500 hover:bg-gray-50" 
          : "bg-white border-gray-300 hover:bg-gray-50 hover:border-red-500"
      } ${isClickAnimating ? 'dislike-click-animation' : ''}`}
    >
      <ThumbsDown 
        className={`w-5 h-5 md:w-6 md:h-6 transition-all duration-300 stroke-2 ${
          isDisliked 
            ? "text-red-500 fill-red-500 stroke-red-500" 
            : "text-gray-600 group-hover:text-red-500 group-hover:stroke-red-500 group-hover:scale-110"
        }`}
      />
    </Button>
  );
};