import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEnhancedChannelSubscription } from "@/hooks/channel/useEnhancedChannelSubscription";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { toast } from "sonner";
import { cleanVideoTitle } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { useVideoDate } from "@/components/video/useVideoDate";

interface Video {
  id: string;
  video_id: string;
  title: string;
  thumbnail: string;
  channel_name: string;
  channel_id: string;
  views: number;
  uploaded_at: string | Date;
}

interface FriendlyChannelSectionProps {
  channelName: string;
  channelId?: string;
  channelThumbnail?: string;
  description?: string;
  channelVideos?: Video[];
  isLoadingVideos?: boolean;
  compact?: boolean;
  hideChannelInfo?: boolean;
}

const formatViewCount = (count: number): string => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M views`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K views`;
  return `${count} views`;
};

export const FriendlyChannelSection = ({ 
  channelName, 
  channelId,
  channelThumbnail,
  description,
  channelVideos = [],
  isLoadingVideos = false,
  compact = false,
  hideChannelInfo = false
}: FriendlyChannelSectionProps) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [needsExpand, setNeedsExpand] = useState(false);
  const [showAllVideos, setShowAllVideos] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const { isAuthenticated, isLoading: authLoading, isProfileLoading } = useUnifiedAuth();
  const { getFormattedDate } = useVideoDate();
  
  const { 
    isSubscribed, 
    handleSubscribe, 
    isLoading: subscriptionLoading,
    isUserDataReady
  } = useEnhancedChannelSubscription(channelId);

  useEffect(() => {
    if (descriptionRef.current && description) {
      const element = descriptionRef.current;
      setNeedsExpand(element.scrollHeight > element.clientHeight);
    }
  }, [description]);

  const handleSubscribeClick = async () => {
    if (!isAuthenticated) {
      toast.info("Please sign in to subscribe to channels");
      return;
    }
    
    if (!isUserDataReady) {
      toast.info("Please wait while we load your profile...");
      return;
    }
    
    await handleSubscribe();
  };

  const isLoading = authLoading || isProfileLoading || subscriptionLoading;
  const initialCount = compact ? 4 : 6;
  const displayedVideos = showAllVideos ? channelVideos : channelVideos.slice(0, initialCount);

  return (
    <div className="space-y-4">
      {/* Channel Info - simple row (hidden when channel info is in action bar) */}
      {!hideChannelInfo && (
        <div className="flex items-center gap-3">
          {channelId ? (
            <Link to={`/channel/${channelId}`}>
              <Avatar className={compact ? "h-8 w-8" : "h-10 w-10"}>
                <AvatarImage src={channelThumbnail || ''} alt={channelName} />
                <AvatarFallback className="bg-muted text-muted-foreground text-sm font-bold">
                  {channelName?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className={compact ? "h-8 w-8" : "h-10 w-10"}>
              <AvatarImage src={channelThumbnail || ''} alt={channelName} />
              <AvatarFallback className="bg-muted text-muted-foreground text-sm font-bold">
                {channelName?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          
          <div className="flex-1 min-w-0">
            {channelId ? (
              <Link 
                to={`/channel/${channelId}`}
                className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-foreground hover:text-brand transition-colors block truncate`}
              >
                {channelName}
              </Link>
            ) : (
              <span className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-foreground truncate block`}>{channelName}</span>
            )}
          </div>
          
          {channelId && (
            <Button
              onClick={handleSubscribeClick}
              disabled={isLoading}
              className={`${compact ? 'h-9 px-3 text-xs' : 'h-9 px-4 text-sm'} rounded-control font-semibold transition-all ${
                isSubscribed 
                  ? "bg-muted text-foreground hover:bg-surface-active" 
                  : "bg-primary text-white hover:brightness-90"
              }`}
            >
              {isLoading ? (
                <span className="opacity-70">...</span>
              ) : isSubscribed ? (
                <>
                  <Bell className="w-3.5 h-3.5 mr-1.5 fill-current" />
                  Subscribed
                </>
              ) : (
                "Subscribe"
              )}
            </Button>
          )}
        </div>
      )}
      
      {/* Description - collapsible, minimal */}
      {description && (
        <div className={`bg-muted rounded-card ${compact ? 'p-2.5' : 'p-4'}`}>
          <p 
            ref={descriptionRef}
            className={`${compact ? 'text-[11px]' : 'text-sm'} text-muted-foreground leading-relaxed whitespace-pre-wrap ${
              !isDescriptionExpanded ? 'line-clamp-3' : ''
            }`}
          >
            {description}
          </p>
          
          {needsExpand && (
            <button
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className={`mt-1.5 ${compact ? 'text-[11px]' : 'text-sm'} font-medium text-foreground hover:text-brand transition-colors`}
            >
              {isDescriptionExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      )}
      
      {/* More from this channel - YouTube-style horizontal list */}
      {isLoadingVideos ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : channelVideos.length > 0 ? (
        <div>
          <div className="h-px bg-surface-active mb-4" />
          <div className={`flex items-center justify-between ${compact ? 'mb-2' : 'mb-3'}`}>
            <p className={`${compact ? 'text-[11px]' : 'text-sm'} font-semibold text-foreground`}>
              More from {channelName}
            </p>
            {channelId && (
              <Link 
                to={`/channel/${channelId}`}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                View all
              </Link>
            )}
          </div>
          
          {/* YouTube-style stacked list */}
          <div className={compact ? "space-y-1.5" : "space-y-2.5"}>
            {displayedVideos.map((video) => (
              <Link
                key={video.id}
                to={`/video/${video.video_id || video.id}`}
                className={`flex ${compact ? 'gap-2' : 'gap-3'} group rounded-control hover:bg-surface-hover transition-colors p-1 -mx-1`}
              >
                {/* Thumbnail */}
                <div className={`${compact ? 'w-[110px]' : 'w-[168px]'} flex-shrink-0 aspect-video rounded-card overflow-hidden bg-muted`}>
                  <img
                    src={video.thumbnail || "/placeholder.svg"}
                    alt={cleanVideoTitle(video.title)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0 py-0.5">
                  <h4 className={`${compact ? 'text-[11px]' : 'text-[13px]'} font-medium text-foreground line-clamp-2 leading-snug group-hover:text-foreground`}>
                    {cleanVideoTitle(video.title)}
                  </h4>
                  <p className={`${compact ? 'text-[9px]' : 'text-[11px]'} text-muted-foreground ${compact ? 'mt-0.5' : 'mt-1'} truncate`}>
                    {video.channel_name}
                  </p>
                  <p className={`${compact ? 'text-[9px]' : 'text-[11px]'} text-muted-foreground mt-0.5`}>
                    {formatViewCount(video.views || 0)} • {getFormattedDate(video.uploaded_at)}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Show more / less toggle */}
          {channelVideos.length > initialCount && (
            <button
              onClick={() => setShowAllVideos(!showAllVideos)}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-surface-hover rounded-control transition-colors"
            >
              {showAllVideos ? (
                <>Show less <ChevronUp className="w-3.5 h-3.5" /></>
              ) : (
                <>Show more <ChevronDown className="w-3.5 h-3.5" /></>
              )}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
};
