import { Youtube, UserPlus, Check, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useSessionManager } from "@/hooks/useSessionManager";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const { isMobile } = useIsMobile();
  const fallbackLogo = "/lovable-uploads/efca5adc-d9d2-4c5b-8900-e078f9d49b6a.png";
  const [internalSubscriptionState, setInternalSubscriptionState] = useState<boolean | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

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
    <div className="mb-8 md:mb-10 animate-fade-in">
      {/* Friendly card container */}
      <div className="bg-white rounded-3xl border border-[#E5E5E5] shadow-lg overflow-hidden">
        {/* Top accent bar - solid yellow */}
        <div className="h-2 bg-[#FFCC00]" />
        
        <div className="p-5 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start gap-5 md:gap-8">
            {/* Left side - Avatar */}
            <div className="flex-shrink-0 flex justify-center md:justify-start">
              <div className="relative group">
                <div className="absolute -inset-1 bg-[#FFCC00] rounded-full opacity-75 blur group-hover:opacity-100 transition-opacity duration-300" />
                <Avatar className="relative w-24 h-24 md:w-32 md:h-32 ring-4 ring-white shadow-xl">
                  <AvatarImage
                    src={channel.thumbnail_url}
                    alt={channel.title}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                  />
                  <AvatarFallback className="bg-[#F5F5F5]">
                    <img 
                      src={fallbackLogo} 
                      alt="YidVid Logo" 
                      className="w-12 h-12 md:w-16 md:h-16"
                    />
                  </AvatarFallback>
                  
                  {!imageLoaded && !imageError && (
                    <div className="absolute inset-0 bg-[#F5F5F5] rounded-full flex items-center justify-center">
                      <img 
                        src={fallbackLogo} 
                        alt="Loading" 
                        className="w-12 h-12 md:w-16 md:h-16 animate-pulse"
                      />
                    </div>
                  )}
                </Avatar>
              </div>
            </div>
            
            {/* Right side - Content */}
            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
              {/* Channel name */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1A1A1A] mb-3">
                {channel.title}
              </h1>
              
              {/* Subscribe button */}
              <Button
                variant={displaySubscribed && subscriptionStateKnown ? "default" : "outline"}
                onClick={handleSubscribeClick}
                disabled={buttonLoading}
                className={`h-10 md:h-11 text-sm md:text-base px-5 md:px-6 rounded-full font-medium transition-all duration-300 ${
                  (displaySubscribed && subscriptionStateKnown) 
                    ? "bg-[#FF0000] hover:brightness-90 text-white shadow-lg border-0" 
                    : "border-2 border-[#FFCC00] text-[#1A1A1A] hover:bg-[#FFCC00] hover:text-[#1A1A1A]"
                }`}
                data-subscribed={displaySubscribed && subscriptionStateKnown ? "true" : "false"}
                aria-label={displaySubscribed && subscriptionStateKnown ? "Unsubscribe from channel" : "Subscribe to channel"}
              >
                {buttonLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isProcessing ? "Processing..." : "Loading..."}
                  </>
                ) : displaySubscribed && subscriptionStateKnown ? (
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
              
              {/* Description */}
              {channel.description && (
                <div className="mt-4 md:mt-5">
                  {isMobile ? (
                    <div>
                      <p className={`text-[#666666] text-sm leading-relaxed max-w-2xl ${!descriptionExpanded ? 'line-clamp-2' : ''}`}>
                        {channel.description}
                      </p>
                      {channel.description.length > 100 && (
                        <button
                          onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                          className="flex items-center gap-1 mt-1 text-xs font-medium text-[#666666] hover:text-[#1A1A1A] transition-colors"
                        >
                          {descriptionExpanded ? (
                            <>Show less <ChevronUp className="w-3 h-3" /></>
                          ) : (
                            <>Show more <ChevronDown className="w-3 h-3" /></>
                          )}
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-[#666666] text-sm md:text-base leading-relaxed max-w-2xl">
                      {channel.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
