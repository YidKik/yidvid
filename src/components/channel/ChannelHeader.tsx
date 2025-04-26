import { Youtube, UserPlus, Check, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useSessionManager } from "@/hooks/useSessionManager";
import { toast } from "sonner";

interface ChannelHeaderProps {
  channel: {
    thumbnail_url: string;
    title: string;
    description?: string;
  };
  isSubscribed: boolean;
  onSubscribe: () => Promise<void>;
  isLoading?: boolean;
}

export const ChannelHeader = ({
  channel,
  isSubscribed,
  onSubscribe,
  isLoading = false,
}: ChannelHeaderProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { session, isAuthenticated } = useSessionManager();
  const fallbackLogo = "/lovable-uploads/efca5adc-d9d2-4c5b-8900-e078f9d49b6a.png";
  const [internalSubscriptionState, setInternalSubscriptionState] = useState(isSubscribed);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync internal state with prop when it changes
  useEffect(() => {
    setInternalSubscriptionState(isSubscribed);
  }, [isSubscribed]);

  const handleSubscribeClick = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to subscribe to channels", { id: "signin-required" });
      return;
    }
    
    if (isProcessing || isLoading) {
      console.log("Already processing subscription action, ignoring click");
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Call the provided onSubscribe handler
      await onSubscribe();
      
      // Update internal state after successful subscription
      setInternalSubscriptionState(!internalSubscriptionState);
      
      // Show success toast
      toast.success(internalSubscriptionState ? "Unsubscribed from channel" : "Subscribed to channel");
    } catch (error) {
      console.error("Error in subscription action:", error);
      
      // Revert optimistic update on error
      setInternalSubscriptionState(isSubscribed);
      
      if (error instanceof Error) {
        toast.error(`Subscription failed: ${error.message}`);
      } else {
        toast.error("Could not process subscription - please try again");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Determine the actual loading state (either component loading or processing a subscription action)
  const buttonLoading = isLoading || isProcessing;
  
  // Determine the correct visual state for the button
  const displaySubscribed = internalSubscriptionState;

  return (
    <div className="flex flex-col items-center mb-6 md:mb-8">
      <Avatar className="w-20 h-20 md:w-32 md:h-32 mb-3 md:mb-4 opacity-0 animate-[scaleIn_0.6s_ease-out_0.3s_forwards] group relative">
        <AvatarImage
          src={channel.thumbnail_url}
          alt={channel.title}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
        <AvatarFallback className="bg-primary/10">
          <img 
            src={fallbackLogo} 
            alt="YidVid Logo" 
            className="w-10 h-10 md:w-16 md:h-16"
          />
        </AvatarFallback>
        
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-100 rounded-full flex items-center justify-center">
            <img 
              src={fallbackLogo} 
              alt="Loading" 
              className="w-10 h-10 md:w-16 md:h-16 animate-pulse"
            />
          </div>
        )}
      </Avatar>
      
      <h1 className="text-xl md:text-3xl font-bold text-center mb-2 opacity-0 animate-[fadeIn_0.6s_ease-out_0.4s_forwards]">
        {channel.title}
      </h1>
      
      <Button
        variant={displaySubscribed ? "default" : "outline"}
        onClick={handleSubscribeClick}
        disabled={buttonLoading}
        className={`h-7 md:h-9 text-xs md:text-sm px-2.5 md:px-3.5 mb-2 md:mb-3 transition-all duration-200 ${
          displaySubscribed ? "bg-primary hover:bg-primary-hover text-white shadow-md" : ""
        }`}
        data-subscribed={displaySubscribed ? "true" : "false"}
        aria-label={displaySubscribed ? "Unsubscribe from channel" : "Subscribe to channel"}
      >
        {buttonLoading ? (
          <>
            <Loader2 className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1 md:mr-1.5 animate-spin" />
            {isProcessing ? "Processing..." : "Loading..."}
          </>
        ) : displaySubscribed ? (
          <>
            <Check className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1 md:mr-1.5" />
            Subscribed
          </>
        ) : (
          <>
            <UserPlus className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1 md:mr-1.5" />
            Subscribe
          </>
        )}
      </Button>

      {channel.description && (
        <div className="mt-2 opacity-0 animate-[fadeIn_0.6s_ease-out_0.5s_forwards]">
          <p className="text-muted-foreground text-xs md:text-sm text-center max-w-2xl">
            {channel.description}
          </p>
        </div>
      )}
    </div>
  );
};
