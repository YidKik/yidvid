import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useEnhancedChannelSubscription } from "@/hooks/channel/useEnhancedChannelSubscription";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { VideoCard } from "@/components/VideoCard";

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
}

export const FriendlyChannelSection = ({ 
  channelName, 
  channelId,
  channelThumbnail,
  description,
  channelVideos = [],
  isLoadingVideos = false,
  compact = false
}: FriendlyChannelSectionProps) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [needsExpand, setNeedsExpand] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const { isAuthenticated, isLoading: authLoading, isProfileLoading } = useUnifiedAuth();
  
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

  return (
    <div className="space-y-4">
      {/* Channel Info - simple row */}
      <div className="flex items-center gap-3">
        {channelId ? (
          <Link to={`/channel/${channelId}`}>
            <Avatar className={compact ? "h-8 w-8" : "h-10 w-10"}>
              <AvatarImage src={channelThumbnail || ''} alt={channelName} />
              <AvatarFallback className="bg-[#F5F5F5] text-[#666666] text-sm font-bold">
                {channelName?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
        ) : (
          <Avatar className={compact ? "h-8 w-8" : "h-10 w-10"}>
            <AvatarImage src={channelThumbnail || ''} alt={channelName} />
            <AvatarFallback className="bg-[#F5F5F5] text-[#666666] text-sm font-bold">
              {channelName?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className="flex-1 min-w-0">
          {channelId ? (
            <Link 
              to={`/channel/${channelId}`}
              className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-[#1A1A1A] hover:text-[#FF0000] transition-colors block truncate`}
            >
              {channelName}
            </Link>
          ) : (
            <span className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-[#1A1A1A] truncate block`}>{channelName}</span>
          )}
        </div>
        
        {channelId && (
          <Button
            onClick={handleSubscribeClick}
            disabled={isLoading}
            className={`${compact ? 'h-7 px-3 text-xs' : 'h-9 px-4 text-sm'} rounded-full font-semibold transition-all ${
              isSubscribed 
                ? "bg-[#F5F5F5] text-[#1A1A1A] hover:bg-[#E5E5E5]" 
                : "bg-[#FF0000] text-white hover:brightness-90"
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
      
      {/* Description - collapsible, minimal */}
      {description && (
        <div className={`bg-[#F5F5F5] rounded-xl ${compact ? 'p-3' : 'p-4'}`}>
          <p 
            ref={descriptionRef}
            className={`${compact ? 'text-xs' : 'text-sm'} text-[#666666] leading-relaxed whitespace-pre-wrap ${
              !isDescriptionExpanded ? 'line-clamp-3' : ''
            }`}
          >
            {description}
          </p>
          
          {needsExpand && (
            <button
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="mt-2 text-sm font-medium text-[#1A1A1A] hover:text-[#FF0000] transition-colors"
            >
              {isDescriptionExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      )}
      
      {/* More from this channel - compact, max 1 row */}
      {isLoadingVideos ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : channelVideos.length > 0 ? (
        <div>
          <div className="h-px bg-[#E5E5E5] mb-4" />
          <p className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-[#666666] mb-3`}>
            More from {channelName}
          </p>
          
          <div className={`grid ${compact ? 'gap-2 grid-cols-2' : 'gap-3 grid-cols-3'}`}>
            {channelVideos.slice(0, compact ? 4 : 3).map((video) => (
              <div key={video.id} className="rounded-lg overflow-hidden">
                <VideoCard
                  id={video.id}
                  video_id={video.video_id}
                  title={video.title}
                  thumbnail={video.thumbnail || "/placeholder.svg"}
                  channelName={video.channel_name}
                  channelId={video.channel_id}
                  views={video.views}
                  uploadedAt={video.uploaded_at}
                  hideChannelName
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
