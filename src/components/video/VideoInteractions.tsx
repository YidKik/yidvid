
import { ThumbsUp, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LikeAnimation } from "./LikeAnimation";
import { DislikeButton } from "./DislikeButton";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";

interface VideoInteractionsProps {
  videoId: string;
}

type InteractionType = 'view' | 'like' | 'dislike' | 'save';

export const VideoInteractions = ({ videoId }: VideoInteractionsProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [isClickAnimating, setIsClickAnimating] = useState(false);
  
  const { isAuthenticated, user } = useUnifiedAuth();
  const userId = user?.id;


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

        // No toast notification as requested
      } catch (error) {
        console.error('Error liking video:', error);
      }
    }
  };

  const handleShare = async () => {
    const baseUrl = window.location.origin;
    const shortUrl = `${baseUrl}/video/${videoId}`;
    
    try {
      await navigator.clipboard.writeText(shortUrl);
      // No toast notification as requested
      
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          url: shortUrl,
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Silent error - no toast
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

        <DislikeButton videoId={videoId} />

        <Button
          variant="outline"
          onClick={handleShare}
          className="group relative rounded-full p-2 md:p-3 transition-all duration-300 active:scale-90 border bg-white border-gray-300 hover:bg-gray-50 hover:border-red-500"
        >
          <Share className="w-5 h-5 md:w-6 md:h-6 transition-all duration-300 stroke-2 text-gray-600 group-hover:text-red-500 group-hover:stroke-red-500 group-hover:scale-110" />
        </Button>
      </div>
    </>
  );
};
