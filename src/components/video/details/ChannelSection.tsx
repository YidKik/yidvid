import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Check, Loader2, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEnhancedChannelSubscription } from "@/hooks/channel/useEnhancedChannelSubscription";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { toast } from "sonner";

interface ChannelSectionProps {
  channelName: string;
  channelId?: string;
  channelThumbnail?: string;
  views?: number;
  uploadedAt: string | Date;
}

export const ChannelSection = ({ 
  channelName, 
  channelId,
  channelThumbnail,
  views,
  uploadedAt
}: ChannelSectionProps) => {
  const { isAuthenticated, isLoading: authLoading, isProfileLoading } = useUnifiedAuth();
  
  const { 
    isSubscribed, 
    handleSubscribe, 
    isLoading: subscriptionLoading,
    isUserDataReady
  } = useEnhancedChannelSubscription(channelId);

  // Format the date with robust error handling
  const getFormattedDate = () => {
    try {
      if (!uploadedAt) return "recently";
      
      let dateToFormat: Date;
      
      if (typeof uploadedAt === "string") {
        dateToFormat = new Date(uploadedAt);
      } else if (uploadedAt instanceof Date) {
        dateToFormat = uploadedAt;
      } else {
        return "recently";
      }
      
      if (isNaN(dateToFormat.getTime())) {
        console.warn("Invalid date in ChannelSection:", uploadedAt);
        return "recently";
      }
      
      return formatDistanceToNow(dateToFormat, { addSuffix: true });
    } catch (error) {
      console.error("Error formatting date in ChannelSection:", error);
      return "recently";
    }
  };

  const formattedDate = getFormattedDate();
  const formattedViews = views?.toLocaleString() || "0";

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
    <div className="bg-card/30 rounded-xl p-6 border border-border/50 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {channelId ? (
            <Link to={`/channel/${channelId}`} className="hover:opacity-80 transition-opacity">
              <Avatar className="h-12 w-12 ring-2 ring-background shadow-lg">
                <AvatarImage src={channelThumbnail || ''} alt={channelName} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  <img src="/lovable-uploads/efca5adc-d9d2-4c5b-8900-e078f9d49b6a.png" alt="YidVid Logo" className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className="h-12 w-12 ring-2 ring-background shadow-lg">
              <AvatarImage src={channelThumbnail || ''} alt={channelName} />
              <AvatarFallback className="bg-primary/10 text-primary">
                <img src="/lovable-uploads/efca5adc-d9d2-4c5b-8900-e078f9d49b6a.png" alt="YidVid Logo" className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
          )}
          
          <div className="flex flex-col flex-1">
            {channelId ? (
              <Link 
                to={`/channel/${channelId}`}
                className="font-semibold text-lg hover:text-primary transition-colors"
              >
                {channelName}
              </Link>
            ) : (
              <h3 className="font-semibold text-lg">{channelName}</h3>
            )}
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
              <span className="font-medium">{formattedViews} views</span>
              <span className="w-1 h-1 bg-muted-foreground/60 rounded-full"></span>
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Subscribe button */}
        {channelId && (
          <>
            {isAuthenticated ? (
              <Button
                variant={isSubscribed ? "default" : "outline"}
                onClick={handleSubscribeClick}
                disabled={isLoading}
                className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 active:scale-95 shadow-sm
                  ${isSubscribed 
                    ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground border-destructive" 
                    : "bg-background hover:bg-accent hover:text-accent-foreground border-border hover:border-primary/50"
                  }
                `}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : isSubscribed ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    <span>Subscribed</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    <span>Subscribe</span>
                  </>
                )}
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => toast.info("Please sign in to subscribe to channels")}
                className="rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 active:scale-95 shadow-sm bg-background hover:bg-accent hover:text-accent-foreground border-border hover:border-primary/50"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                <span>Subscribe</span>
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};