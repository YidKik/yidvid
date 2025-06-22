
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { ChevronRight, ChevronDown, UserPlus, Check, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useChannelSubscription } from "@/hooks/channel/useChannelSubscription";
import { useSessionManager } from "@/hooks/useSessionManager";
import { toast } from "sonner";

interface VideoInfoProps {
  title: string;
  channelName: string;
  channelId?: string;
  channelThumbnail?: string;
  views?: number;
  uploadedAt: string | Date;
  description?: string;
}

export const VideoInfo = ({ 
  channelName, 
  channelId,
  channelThumbnail,
  description,
  views,
  uploadedAt
}: VideoInfoProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { session, isAuthenticated, isLoading: isSessionLoading } = useSessionManager();
  
  const { 
    isSubscribed, 
    handleSubscribe, 
    isLoading: isLoadingSubscription 
  } = useChannelSubscription(channelId || undefined);

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
        return "recently"; // Fallback for unexpected types
      }
      
      // Check if date is valid
      if (isNaN(dateToFormat.getTime())) {
        console.warn("Invalid date in VideoInfo:", uploadedAt);
        return "recently";
      }
      
      return formatDistanceToNow(dateToFormat, { addSuffix: true });
    } catch (error) {
      console.error("Error formatting date in VideoInfo:", error);
      return "recently";
    }
  };

  const formattedDate = getFormattedDate();
  const formattedViews = views?.toLocaleString() || "0";

  const handleSubscribeClick = async () => {
    try {
      if (isSessionLoading) {
        toast.info("Please wait while we verify your account");
        return;
      }
      
      if (!isAuthenticated) {
        toast.error("Please sign in to subscribe to channels");
        return;
      }
      
      await handleSubscribe();
      
      // Show success message with channel name
      if (!isSubscribed) {
        toast.success(`Successfully subscribed to ${channelName}! You'll be notified of new videos.`);
      } else {
        toast.success(`Unsubscribed from ${channelName}`);
      }
    } catch (error) {
      console.error("Subscribe error:", error);
      toast.error("Failed to update subscription. Please try again.");
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {channelId ? (
            <Link to={`/channel/${channelId}`} className="hover:opacity-80 transition-opacity">
              <Avatar className="h-10 w-10 md:h-12 md:w-12 ring-2 ring-background shadow-lg">
                <AvatarImage src={channelThumbnail || ''} alt={channelName} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  <img src="/lovable-uploads/efca5adc-d9d2-4c5b-8900-e078f9d49b6a.png" alt="YidVid Logo" className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className="h-10 w-10 md:h-12 md:w-12 ring-2 ring-background shadow-lg">
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
                className="font-medium text-sm md:text-base hover:text-primary transition-colors"
              >
                {channelName}
              </Link>
            ) : (
              <h3 className="font-medium text-sm md:text-base">{channelName}</h3>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formattedViews} views</span>
              <span>•</span>
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Subscribe button for authenticated users */}
        {channelId && isAuthenticated && (
          <Button
            variant={isSubscribed ? "default" : "outline"}
            onClick={handleSubscribeClick}
            disabled={isLoadingSubscription || isSessionLoading}
            className={`ml-4 rounded-full px-4 py-2 text-sm transition-all duration-300 active:scale-95 font-medium
              ${isSubscribed 
                ? "bg-red-500 border-red-500 hover:bg-red-600 text-white shadow-md" 
                : "bg-white border-gray-300 hover:bg-gray-50 hover:border-red-500 text-gray-700 hover:text-red-500"
              }
            `}
          >
            {isLoadingSubscription || isSessionLoading ? (
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
        )}

        {/* Sign in prompt for non-authenticated users */}
        {channelId && !isAuthenticated && (
          <Button
            variant="outline"
            onClick={() => toast.info("Please sign in to subscribe to channels")}
            className="ml-4 rounded-full px-4 py-2 text-sm transition-all duration-300 active:scale-95 font-medium bg-white border-gray-300 hover:bg-gray-50 hover:border-red-500 text-gray-700 hover:text-red-500"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            <span>Subscribe</span>
          </Button>
        )}
      </div>

      {description && (
        <div className="bg-card/50 rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              <p className={`text-sm text-card-foreground/90 whitespace-pre-wrap transition-all duration-300 ${
                isExpanded ? '' : 'line-clamp-3'
              }`}>
                {description}
              </p>
            </div>
            
            {description.length > 200 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                aria-label={isExpanded ? "Show less" : "Show more"}
              >
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors" />
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
