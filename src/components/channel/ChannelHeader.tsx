import { Youtube, UserPlus, Check, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useSessionManager } from "@/hooks/useSessionManager";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const { session, isAuthenticated, isLoading: isSessionLoading } = useSessionManager();
  const fallbackLogo = "/lovable-uploads/efca5adc-d9d2-4c5b-8900-e078f9d49b6a.png";
  const [internalSubscriptionState, setInternalSubscriptionState] = useState<boolean | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Set initial subscription state and mark initial load as complete
  useEffect(() => {
    if (!initialLoadComplete && !isLoading) {
      setInternalSubscriptionState(isSubscribed);
      setInitialLoadComplete(true);
    }
  }, [isSubscribed, isLoading, initialLoadComplete]);

  // Update internal state when prop changes after initial load
  useEffect(() => {
    if (initialLoadComplete) {
      setInternalSubscriptionState(isSubscribed);
    }
  }, [isSubscribed, initialLoadComplete]);

  const handleSubscribeClick = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to subscribe to channels", { id: "signin-required" });
      return;
    }
    
    if (isProcessing || isLoading || isSessionLoading) {
      console.log("Already processing subscription action or session is still loading, ignoring click");
      return;
    }
    
    if (!session?.user?.id) {
      console.error("No user ID available in session");
      
      // Try to refresh session first
      try {
        console.log("Attempting to refresh session");
        const { data } = await supabase.auth.getSession();
        
        if (!data.session?.user?.id) {
          toast.error("Authentication error. Please sign in again.");
          return;
        }
        
        console.log("Session refreshed successfully, proceeding with subscription");
      } catch (error) {
        console.error("Session refresh failed:", error);
        toast.error("Authentication error. Please sign in again.");
        return;
      }
    }
    
    try {
      setIsProcessing(true);
      // Optimistically update UI state for better user experience
      if (internalSubscriptionState !== undefined) {
        setInternalSubscriptionState(!internalSubscriptionState);
      }
      
      await onSubscribe();
      // Note: We don't need to set state here as it will be updated
      // in the useEffect that watches isSubscribed
    } catch (error) {
      console.error("Error in subscription action:", error);
      // Revert the optimistic update if there's an error
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
  const buttonLoading = isLoading || isProcessing || isSessionLoading;
  
  // Determine the correct visual state for the button
  // Only show subscription state if we have confirmed it (not undefined)
  const displaySubscribed = internalSubscriptionState === undefined ? false : internalSubscriptionState;
  const subscriptionStateKnown = internalSubscriptionState !== undefined;

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
        variant={displaySubscribed && subscriptionStateKnown ? "default" : "outline"}
        onClick={handleSubscribeClick}
        disabled={buttonLoading}
        className={`h-7 md:h-9 text-xs md:text-sm px-2.5 md:px-3.5 mb-2 md:mb-3 transition-all duration-200 ${
          (displaySubscribed && subscriptionStateKnown) ? "bg-primary hover:bg-primary-hover text-white shadow-md" : ""
        }`}
        data-subscribed={displaySubscribed && subscriptionStateKnown ? "true" : "false"}
        aria-label={displaySubscribed && subscriptionStateKnown ? "Unsubscribe from channel" : "Subscribe to channel"}
      >
        {buttonLoading ? (
          <>
            <Loader2 className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1 md:mr-1.5 animate-spin" />
            {isProcessing ? "Processing..." : "Loading..."}
          </>
        ) : displaySubscribed && subscriptionStateKnown ? (
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
