import { ThumbsUp, ThumbsDown, Share2, Eye, Clock, Copy, Facebook, Twitter, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { ReportVideoDialog } from "@/components/video/ReportVideoDialog";
import { toast } from "sonner";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FriendlyVideoActionBarProps {
  videoId: string;
  youtubeVideoId: string;
  views?: number;
  uploadedAt?: string;
  compact?: boolean;
}

type InteractionType = 'view' | 'like' | 'dislike' | 'save';

// Subtle hover styles for action buttons
const actionButtonBase = "h-10 px-4 rounded-full font-medium transition-all duration-200 bg-muted/40 hover:bg-muted/60 text-muted-foreground hover:text-foreground";
const actionButtonBaseCompact = "h-8 px-3 rounded-full text-sm transition-all duration-200 bg-muted/40 hover:bg-muted/60 text-muted-foreground hover:text-foreground";

export const FriendlyVideoActionBar = ({ 
  videoId, 
  youtubeVideoId, 
  views = 0,
  uploadedAt,
  compact = false 
}: FriendlyVideoActionBarProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  
  const { isAuthenticated, user } = useUnifiedAuth();
  const userId = user?.id;

  const shareUrl = `${window.location.origin}/video/${youtubeVideoId}`;
  const shareTitle = document.title;

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
        toast.success("Added to liked videos");
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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied!");
      setShareOpen(false);
    } catch (error) {
      console.error('Error copying:', error);
    }
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          url: shareUrl,
        });
        setShareOpen(false);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const shareOptions = [
    { 
      name: "Copy Link", 
      icon: Copy, 
      action: handleCopyLink,
      color: "text-gray-600"
    },
    { 
      name: "WhatsApp", 
      icon: MessageCircle, 
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`, '_blank'),
      color: "text-green-600"
    },
    { 
      name: "Facebook", 
      icon: Facebook, 
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank'),
      color: "text-blue-600"
    },
    { 
      name: "Twitter", 
      icon: Twitter, 
      action: () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank'),
      color: "text-sky-500"
    },
    { 
      name: "Email", 
      icon: Mail, 
      action: () => window.open(`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareUrl)}`, '_blank'),
      color: "text-red-500"
    },
  ];

  if (compact) {
    return (
      <div className="space-y-3">
        {/* Meta info */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/30 rounded-full">
            <Eye className="h-3.5 w-3.5" />
            <span>{formatViewCount(views)} views</span>
          </div>
          {uploadedAt && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/30 rounded-full">
              <Clock className="h-3.5 w-3.5" />
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
            className={`${actionButtonBaseCompact} ${
              isLiked ? "bg-red-50 text-red-500" : ""
            }`}
          >
            <ThumbsUp className={`h-4 w-4 mr-1.5 ${isLiked ? "fill-current" : ""}`} />
            Like
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDislike}
            className={`${actionButtonBaseCompact} ${
              isDisliked ? "bg-muted text-foreground" : ""
            }`}
          >
            <ThumbsDown className={`h-4 w-4 ${isDisliked ? "fill-current" : ""}`} />
          </Button>

          <Popover open={shareOpen} onOpenChange={setShareOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={actionButtonBaseCompact}
              >
                <Share2 className="h-4 w-4 mr-1.5" />
                Share
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="start">
              <div className="space-y-1">
                {shareOptions.map((option) => (
                  <button
                    key={option.name}
                    onClick={() => { option.action(); setShareOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <option.icon className={`h-4 w-4 ${option.color}`} />
                    <span className="text-sm">{option.name}</span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <ReportVideoDialog videoId={videoId} compact />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Meta info row */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-full">
          <Eye className="h-4 w-4" />
          <span className="font-medium">{formatViewCount(views)} views</span>
        </div>
        {uploadedAt && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-full">
            <Clock className="h-4 w-4" />
            <span className="font-medium">{getFormattedDate(uploadedAt)}</span>
          </div>
        )}
      </div>
      
      {/* Action buttons row - subtle styling */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Like Button */}
        <Button
          variant="ghost"
          onClick={handleLike}
          className={`${actionButtonBase} ${
            isLiked ? "bg-red-50 text-red-500" : ""
          }`}
        >
          <ThumbsUp className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
          {isLiked ? "Liked" : "Like"}
        </Button>

        {/* Dislike Button */}
        <Button
          variant="ghost"
          onClick={handleDislike}
          className={`${actionButtonBase} px-3 ${
            isDisliked ? "bg-muted text-foreground" : ""
          }`}
        >
          <ThumbsDown className={`h-4 w-4 ${isDisliked ? "fill-current" : ""}`} />
        </Button>

        {/* Share Button with Popover */}
        <Popover open={shareOpen} onOpenChange={setShareOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className={actionButtonBase}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="start">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground px-3 py-1.5 font-medium">Share this video</p>
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={() => { option.action(); setShareOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <option.icon className={`h-4 w-4 ${option.color}`} />
                  <span className="text-sm font-medium">{option.name}</span>
                </button>
              ))}
              {navigator.share && (
                <button
                  onClick={handleShareNative}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left border-t border-border mt-1 pt-2"
                >
                  <Share2 className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">More options...</span>
                </button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Report Button */}
        <ReportVideoDialog videoId={videoId} />
      </div>
    </div>
  );
};