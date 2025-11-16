import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Check, Loader2, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEnhancedChannelSubscription } from "@/hooks/channel/useEnhancedChannelSubscription";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const { isMobile } = useIsMobile();
  
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
    <div className="py-4 border-t border-border/30">
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
                className={`font-semibold hover:text-primary transition-colors ${
                  isMobile ? "text-sm truncate" : "text-lg"
                }`}
              >
                {channelName}
              </Link>
            ) : (
              <h3 className={`font-semibold ${isMobile ? "text-sm truncate" : "text-lg"}`}>
                {channelName}
              </h3>
            )}
            <div className={`flex ${isMobile ? "flex-col gap-1" : "items-center gap-3"} text-muted-foreground mt-1`}>
              <span className={`font-medium ${isMobile ? "text-xs truncate" : "text-sm"}`}>
                {formattedViews} views
              </span>
              {!isMobile && <span className="w-1 h-1 bg-muted-foreground/60 rounded-full"></span>}
              <span className={`${isMobile ? "text-xs truncate" : "text-sm"}`}>
                {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Subscribe button with improved styling */}
        {channelId && (
          <>
            {isAuthenticated ? (
              <Button
                variant={isSubscribed ? "default" : "outline"}
                onClick={handleSubscribeClick}
                disabled={isLoading}
                className={`rounded-full transition-all duration-300 active:scale-95 shadow-sm ${
                  isMobile ? "px-4 py-2 text-xs" : "px-6 py-2.5 text-sm"
                } font-semibold
                  ${isSubscribed 
                    ? "bg-red-500 hover:bg-red-600 text-primary-foreground border-red-500 hover:border-red-600 shadow-md" 
                    : "bg-card hover:bg-muted hover:text-red-500 border-border hover:border-red-500"
                  }
                `}
              >
                {isLoading ? (
                  <>
                    <Loader2 className={`animate-spin mr-2 ${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                    <span className={isMobile ? "text-xs" : "text-sm"}>Loading...</span>
                  </>
                ) : isSubscribed ? (
                  <>
                    <Check className={`mr-2 ${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                    <span className={isMobile ? "text-xs" : "text-sm"}>Subscribed</span>
                  </>
                ) : (
                  <>
                    <UserPlus className={`mr-2 ${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                    <span className={isMobile ? "text-xs" : "text-sm"}>Subscribe</span>
                  </>
                )}
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => {}} // No toast notification as requested
                className={`rounded-full transition-all duration-300 active:scale-95 shadow-sm ${
                  isMobile ? "px-4 py-2 text-xs" : "px-6 py-2.5 text-sm"
                } font-semibold bg-card hover:bg-muted hover:text-red-500 border-border hover:border-red-500`}
              >
                <UserPlus className={`mr-2 ${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                <span className={isMobile ? "text-xs" : "text-sm"}>Subscribe</span>
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};