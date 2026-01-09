import { ThumbsUp, ThumbsDown, Share2, Flag, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { ReportVideoDialog } from "@/components/video/ReportVideoDialog";

interface VideoActionBarProps {
  videoId: string;
  youtubeVideoId: string;
  compact?: boolean;
}

type InteractionType = 'view' | 'like' | 'dislike' | 'save';

export const VideoActionBar = ({ videoId, youtubeVideoId, compact = false }: VideoActionBarProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  
  const { isAuthenticated, user } = useUnifiedAuth();
  const userId = user?.id;

  const handleLike = async () => {
    setIsLiked(!isLiked);
    if (isDisliked) setIsDisliked(false);
    
    if (isAuthenticated && userId && !isLiked) {
      try {
        await supabase
          .from('user_video_interactions')
          .insert({
            user_id: userId,
            video_id: videoId,
            interaction_type: 'like' as InteractionType
          });
      } catch (error) {
        console.error('Error saving like:', error);
      }
    }
  };

  const handleDislike = async () => {
    setIsDisliked(!isDisliked);
    if (isLiked) setIsLiked(false);
    
    if (isAuthenticated && userId && !isDisliked) {
      try {
        await supabase
          .from('user_video_interactions')
          .insert({
            user_id: userId,
            video_id: videoId,
            interaction_type: 'dislike' as InteractionType
          });
      } catch (error) {
        console.error('Error saving dislike:', error);
      }
    }
  };

  const handleShare = async () => {
    const baseUrl = window.location.origin;
    const shortUrl = `${baseUrl}/video/${youtubeVideoId}`;
    
    try {
      await navigator.clipboard.writeText(shortUrl);
      
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          url: shortUrl,
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const buttonClass = compact 
    ? "h-8 px-2 text-xs gap-1" 
    : "h-9 px-3 text-sm gap-1.5";
    
  const iconClass = compact ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <div className="flex items-center gap-2">
      {/* Like Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        className={`${buttonClass} rounded-full hover:bg-primary/10 transition-colors ${
          isLiked ? "text-primary bg-primary/10" : "text-muted-foreground"
        }`}
      >
        <ThumbsUp className={`${iconClass} ${isLiked ? "fill-current" : ""}`} />
        {!compact && <span>Like</span>}
      </Button>

      {/* Dislike Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDislike}
        className={`${buttonClass} rounded-full hover:bg-muted transition-colors ${
          isDisliked ? "text-foreground bg-muted" : "text-muted-foreground"
        }`}
      >
        <ThumbsDown className={`${iconClass} ${isDisliked ? "fill-current" : ""}`} />
      </Button>

      {/* Share Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        className={`${buttonClass} rounded-full hover:bg-muted text-muted-foreground`}
      >
        <Share2 className={iconClass} />
        {!compact && <span>Share</span>}
      </Button>

      {/* Report Button */}
      <ReportVideoDialog videoId={videoId} compact={compact} />
    </div>
  );
};
