import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Bell, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useEnhancedChannelSubscription } from "@/hooks/channel/useEnhancedChannelSubscription";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { toast } from "sonner";
import { useState } from "react";

interface FriendlyChannelSectionProps {
  channelName: string;
  channelId?: string;
  channelThumbnail?: string;
  description?: string;
  compact?: boolean;
}

export const FriendlyChannelSection = ({ 
  channelName, 
  channelId,
  channelThumbnail,
  description,
  compact = false
}: FriendlyChannelSectionProps) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const { isAuthenticated, isLoading: authLoading, isProfileLoading } = useUnifiedAuth();
  
  const { 
    isSubscribed, 
    handleSubscribe, 
    isLoading: subscriptionLoading,
    isUserDataReady
  } = useEnhancedChannelSubscription(channelId);

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
  const shouldShowExpand = description && description.length > 200;

  return (
    <div className="bg-gradient-to-br from-card via-card to-primary/5 rounded-3xl shadow-2xl shadow-primary/10 overflow-hidden">
      {/* Channel Info Header */}
      <div className="p-6 bg-gradient-to-r from-primary/8 via-primary/4 to-transparent">
        <div className="flex items-center gap-4">
          {/* Channel Avatar */}
          {channelId ? (
            <Link to={`/channel/${channelId}`} className="group">
              <Avatar className="h-16 w-16 ring-4 ring-primary/20 shadow-lg group-hover:ring-primary/40 transition-all">
                <AvatarImage src={channelThumbnail || ''} alt={channelName} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xl font-bold">
                  {channelName?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className="h-16 w-16 ring-4 ring-primary/20 shadow-lg">
              <AvatarImage src={channelThumbnail || ''} alt={channelName} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xl font-bold">
                {channelName?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          
          {/* Channel Name & Subscribe */}
          <div className="flex-1 min-w-0">
            {channelId ? (
              <Link 
                to={`/channel/${channelId}`}
                className="text-lg font-bold text-foreground hover:text-primary transition-colors block truncate"
              >
                {channelName}
              </Link>
            ) : (
              <h3 className="text-lg font-bold text-foreground truncate">{channelName}</h3>
            )}
            <p className="text-sm text-muted-foreground mt-0.5">Channel</p>
          </div>
          
          {/* Subscribe Button */}
          {channelId && (
            <Button
              variant={isSubscribed ? "default" : "default"}
              onClick={handleSubscribeClick}
              disabled={isLoading}
              className={`h-11 px-6 rounded-full font-semibold transition-all ${
                isSubscribed 
                  ? "bg-muted text-foreground hover:bg-muted/80" 
                  : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
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
      
      {/* Description Section */}
      {description && (
        <div className="px-6 pb-6">
          <div className="pt-5 mt-2 bg-gradient-to-r from-primary/5 via-muted/30 to-transparent rounded-2xl p-4">
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              About this video
            </h4>
            <p className={`text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap ${
              !isDescriptionExpanded && shouldShowExpand ? 'line-clamp-3' : ''
            }`}>
              {description}
            </p>
            
            {shouldShowExpand && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="mt-2 text-primary hover:text-primary/80 hover:bg-primary/5 px-3 rounded-full"
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
    </div>
  );
};
