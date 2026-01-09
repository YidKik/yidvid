import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check, Loader2, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useEnhancedChannelSubscription } from "@/hooks/channel/useEnhancedChannelSubscription";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { toast } from "sonner";

interface VideoChannelCardProps {
  channelName: string;
  channelId?: string;
  channelThumbnail?: string;
  channelDescription?: string;
  compact?: boolean;
}

export const VideoChannelCard = ({ 
  channelName, 
  channelId,
  channelThumbnail,
  channelDescription,
  compact = false
}: VideoChannelCardProps) => {
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

  if (compact) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {channelId ? (
            <Link to={`/channel/${channelId}`}>
              <Avatar className="h-10 w-10 ring-2 ring-background">
                <AvatarImage src={channelThumbnail || ''} alt={channelName} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {channelName?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className="h-10 w-10">
              <AvatarImage src={channelThumbnail || ''} alt={channelName} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {channelName?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          
          {channelId ? (
            <Link 
              to={`/channel/${channelId}`}
              className="font-medium text-sm text-foreground hover:text-primary transition-colors"
            >
              {channelName}
            </Link>
          ) : (
            <span className="font-medium text-sm text-foreground">{channelName}</span>
          )}
        </div>

        {channelId && (
          <Button
            variant={isSubscribed ? "default" : "outline"}
            size="sm"
            onClick={handleSubscribeClick}
            disabled={isLoading}
            className={`rounded-full text-xs px-3 ${
              isSubscribed 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-primary/10 hover:text-primary hover:border-primary"
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : isSubscribed ? (
              <>
                <Check className="w-3 h-3 mr-1" />
                Subscribed
              </>
            ) : (
              "Subscribe"
            )}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Channel Avatar */}
      <div className="flex justify-center mb-4">
        {channelId ? (
          <Link to={`/channel/${channelId}`}>
            <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg hover:ring-primary/20 transition-all">
              <AvatarImage src={channelThumbnail || ''} alt={channelName} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {channelName?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
        ) : (
          <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg">
            <AvatarImage src={channelThumbnail || ''} alt={channelName} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
              {channelName?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
      
      {/* Channel Name */}
      <div className="text-center mb-2">
        {channelId ? (
          <Link 
            to={`/channel/${channelId}`}
            className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
          >
            {channelName}
          </Link>
        ) : (
          <h3 className="text-lg font-semibold text-foreground">{channelName}</h3>
        )}
        {channelId && (
          <p className="text-xs text-muted-foreground mt-0.5">@{channelId.slice(0, 12)}...</p>
        )}
      </div>
      
      {/* Channel Description */}
      {channelDescription && (
        <p className="text-sm text-muted-foreground text-center line-clamp-3 mb-4 flex-1">
          {channelDescription}
        </p>
      )}
      
      {/* Subscribe Button */}
      {channelId && (
        <div className="mt-auto">
          <Button
            variant={isSubscribed ? "default" : "outline"}
            onClick={handleSubscribeClick}
            disabled={isLoading}
            className={`w-full rounded-full transition-all ${
              isSubscribed 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-primary/10 hover:text-primary hover:border-primary"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Loading...
              </>
            ) : isSubscribed ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Subscribed
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Subscribe
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
