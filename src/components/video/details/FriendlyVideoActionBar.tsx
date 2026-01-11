import { ThumbsUp, ThumbsDown, Share2, Eye, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { ReportVideoDialog } from "@/components/video/ReportVideoDialog";
import { toast } from "sonner";
import { format, formatDistanceToNow, parseISO } from "date-fns";

interface FriendlyVideoActionBarProps {
  videoId: string;
  youtubeVideoId: string;
  views?: number;
  uploadedAt?: string;
  compact?: boolean;
}

type InteractionType = 'view' | 'like' | 'dislike' | 'save';

export const FriendlyVideoActionBar = ({ 
  videoId, 
  youtubeVideoId, 
  views = 0,
  uploadedAt,
  compact = false 
}: FriendlyVideoActionBarProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  
  const { isAuthenticated, user } = useUnifiedAuth();
  const userId = user?.id;

  // Format view count
  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Format date
  const getFormattedDate = (dateString?: string): string => {
    if (!dateString) return "";
    try {
      const date = parseISO(dateString);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 7) {
        return formatDistanceToNow(date, { addSuffix: true });
      }
      return format(date, "MMM d, yyyy");
    } catch {
      return "";
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.info("Please sign in to like videos");
      return;
    }
    
    setIsLiked(!isLiked);
    if (isDisliked) setIsDisliked(false);
    
    if (userId && !isLiked) {
      try {
        await supabase
          .from('user_video_interactions')
          .insert({
            user_id: userId,
            video_id: videoId,
            interaction_type: 'like' as InteractionType
          });
        toast.success("Added to your liked videos!");
      } catch (error) {
        console.error('Error saving like:', error);
      }
    }
  };

  const handleDislike = async () => {
    if (!isAuthenticated) {
      toast.info("Please sign in to rate videos");
      return;
    }
    
    setIsDisliked(!isDisliked);
    if (isLiked) setIsLiked(false);
    
    if (userId && !isDisliked) {
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
      toast.success("Link copied to clipboard!");
      
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

  if (compact) {
    return (
      <div className="space-y-3">
        {/* Meta info */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" />
            <span>{formatViewCount(views)} views</span>
          </div>
          {uploadedAt && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{getFormattedDate(uploadedAt)}</span>
            </div>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`h-9 px-3 rounded-full transition-all ${
              isLiked 
                ? "bg-red-100 text-red-600 border border-red-300/50" 
                : "bg-muted/50 hover:bg-red-50 hover:text-red-600"
            }`}
          >
            <ThumbsUp className={`h-4 w-4 mr-1.5 ${isLiked ? "fill-current" : ""}`} />
            Like
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDislike}
            className={`h-9 px-3 rounded-full transition-all ${
              isDisliked 
                ? "bg-muted text-foreground" 
                : "bg-muted/50 hover:bg-muted"
            }`}
          >
            <ThumbsDown className={`h-4 w-4 ${isDisliked ? "fill-current" : ""}`} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="h-9 px-3 rounded-full bg-muted/50 hover:bg-accent/50 hover:text-accent-foreground"
          >
            <Share2 className="h-4 w-4 mr-1.5" />
            Share
          </Button>

          <ReportVideoDialog videoId={videoId} compact />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Meta info row */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/40 rounded-full">
          <Eye className="h-4 w-4" />
          <span className="font-medium">{formatViewCount(views)} views</span>
        </div>
        {uploadedAt && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/40 rounded-full">
            <Clock className="h-4 w-4" />
            <span className="font-medium">{getFormattedDate(uploadedAt)}</span>
          </div>
        )}
      </div>
      
      {/* Action buttons row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Like Button - Red/Yellow themed */}
        <Button
          variant="ghost"
          onClick={handleLike}
          className={`h-11 px-5 rounded-full font-medium transition-all ${
            isLiked 
              ? "bg-red-100 text-red-600 border-2 border-red-300/50 shadow-sm" 
              : "bg-muted/60 hover:bg-red-50 hover:text-red-600 hover:border-red-200/30 border-2 border-transparent"
          }`}
        >
          <ThumbsUp className={`h-5 w-5 mr-2 ${isLiked ? "fill-current" : ""}`} />
          {isLiked ? "Liked!" : "Like"}
        </Button>

        {/* Dislike Button */}
        <Button
          variant="ghost"
          onClick={handleDislike}
          className={`h-11 px-4 rounded-full transition-all ${
            isDisliked 
              ? "bg-muted text-foreground border-2 border-border" 
              : "bg-muted/60 hover:bg-muted border-2 border-transparent"
          }`}
        >
          <ThumbsDown className={`h-5 w-5 ${isDisliked ? "fill-current" : ""}`} />
        </Button>

        {/* Share Button */}
        <Button
          variant="ghost"
          onClick={handleShare}
          className="h-11 px-5 rounded-full bg-muted/60 hover:bg-accent/30 font-medium border-2 border-transparent hover:border-accent/20"
        >
          <Share2 className="h-5 w-5 mr-2" />
          Share
        </Button>

        {/* Report Button */}
        <ReportVideoDialog videoId={videoId} />
      </div>
    </div>
  );
};
