import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Bell, ChevronDown, ChevronUp, Sparkles, Play } from "lucide-react";
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

  // Check if description actually needs expand button
  useEffect(() => {
    if (descriptionRef.current && description) {
      const element = descriptionRef.current;
      // Check if content is actually truncated (scrollHeight > clientHeight)
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
    <div className="relative bg-card/90 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden border-2 border-yellow-200/30">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/20 via-transparent to-red-50/15 pointer-events-none" />
      
      {/* Channel Info Header */}
      <div className="relative p-6 bg-gradient-to-r from-yellow-100/40 via-red-50/20 to-transparent">
        <div className="flex items-center gap-4">
          {/* Channel Avatar */}
          {channelId ? (
            <Link to={`/channel/${channelId}`} className="group">
              <Avatar className="h-14 w-14 ring-3 ring-yellow-300/30 shadow-lg group-hover:ring-yellow-400/50 transition-all">
                <AvatarImage src={channelThumbnail || ''} alt={channelName} />
                <AvatarFallback className="bg-gradient-to-br from-yellow-200 to-red-200 text-red-700 text-lg font-bold">
                  {channelName?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className="h-14 w-14 ring-3 ring-yellow-300/30 shadow-lg">
              <AvatarImage src={channelThumbnail || ''} alt={channelName} />
              <AvatarFallback className="bg-gradient-to-br from-yellow-200 to-red-200 text-red-700 text-lg font-bold">
                {channelName?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          
          {/* Channel Name */}
          <div className="flex-1 min-w-0">
            {channelId ? (
              <Link 
                to={`/channel/${channelId}`}
                className="text-lg font-bold text-foreground hover:text-red-600 transition-colors block truncate"
              >
                {channelName}
              </Link>
            ) : (
              <h3 className="text-lg font-bold text-foreground truncate">{channelName}</h3>
            )}
            <p className="text-sm text-muted-foreground mt-0.5">Channel</p>
          </div>
          
          {/* Subscribe Button - Solid Red */}
          {channelId && (
            <Button
              variant={isSubscribed ? "default" : "default"}
              onClick={handleSubscribeClick}
              disabled={isLoading}
              className={`h-10 px-5 rounded-full font-semibold transition-all ${
                isSubscribed 
                  ? "bg-muted text-foreground hover:bg-muted/80" 
                  : "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-300/30 hover:shadow-xl hover:shadow-red-400/40"
              }`}
            >
              {isLoading ? (
                <span className="opacity-70">...</span>
              ) : isSubscribed ? (
                <>
                  <Bell className="w-4 h-4 mr-2 fill-current" />
                  Subscribed
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Subscribe
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      
      {/* Gradient divider */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-yellow-300/40 to-transparent" />
      
      {/* Description Section */}
      {description && (
        <div className="relative px-6 py-5">
          <div className="bg-gradient-to-r from-yellow-50/40 via-red-50/20 to-transparent rounded-2xl p-4 border border-yellow-200/30">
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-yellow-400 to-red-400 rounded-full"></span>
              Description
            </h4>
            <p 
              ref={descriptionRef}
              className={`text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap ${
                !isDescriptionExpanded ? 'line-clamp-3' : ''
              }`}
            >
              {description}
            </p>
            
            {/* Only show expand button if content is actually truncated */}
            {needsExpand && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="mt-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100/50 px-3 rounded-full"
              >
                {isDescriptionExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Show more
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* Divider before videos */}
      {(channelVideos.length > 0 || isLoadingVideos) && (
        <div className="h-0.5 bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent mx-6" />
      )}
      
      {/* More Videos from Channel - Integrated */}
      {isLoadingVideos ? (
        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-yellow-400/20 rounded-xl">
              <Play className="h-4 w-4 text-yellow-600 fill-yellow-600" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Loading more videos...</span>
          </div>
          <div className={`grid gap-4 ${compact ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {[...Array(compact ? 4 : 6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-yellow-100/30 rounded-xl"></div>
                <div className="mt-2 space-y-1.5">
                  <div className="h-3 bg-yellow-100/40 rounded-full w-full"></div>
                  <div className="h-2 bg-yellow-100/30 rounded-full w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : channelVideos.length > 0 ? (
        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-yellow-400/20 rounded-xl">
              <Play className="h-4 w-4 text-yellow-600 fill-yellow-600" />
            </div>
            <span className="text-sm font-medium text-foreground">
              More from this channel
            </span>
          </div>
          
          <div className={`grid gap-4 ${compact ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {channelVideos.slice(0, compact ? 6 : 9).map((video) => (
              <div 
                key={video.id}
                className="group transition-all duration-300 hover:scale-[1.02] rounded-xl overflow-hidden border-2 border-transparent hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-200/40"
              >
                <div className="bg-card/70 backdrop-blur-sm">
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
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};