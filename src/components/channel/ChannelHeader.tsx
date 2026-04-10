import { UserPlus, Check, Loader2, Share2, ChevronDown, ChevronUp } from "lucide-react";
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
  videoCount?: number;
}

export const ChannelHeader = ({
  channel,
  isSubscribed,
  onSubscribe,
  isLoading = false,
  videoCount,
}: ChannelHeaderProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { session, isAuthenticated, isLoading: isSessionLoading } = useSessionManager();
  const { isMobile } = useIsMobile();
  const fallbackLogo = "/yidvid-logo-icon.png";
  const [internalSubscriptionState, setInternalSubscriptionState] = useState<boolean | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  useEffect(() => {
    if (!initialLoadComplete && !isLoading) {
      setInternalSubscriptionState(isSubscribed);
      setInitialLoadComplete(true);
    }
  }, [isSubscribed, isLoading, initialLoadComplete]);

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
    if (isProcessing || isLoading || isSessionLoading) return;
    if (!session?.user?.id) {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session?.user?.id) {
          toast.error("Authentication error. Please sign in again.");
          return;
        }
      } catch {
        toast.error("Authentication error. Please sign in again.");
        return;
      }
    }
    try {
      setIsProcessing(true);
      if (internalSubscriptionState !== undefined) {
        setInternalSubscriptionState(!internalSubscriptionState);
      }
      await onSubscribe();
    } catch (error) {
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

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: channel.title, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  const buttonLoading = isLoading || isProcessing || isSessionLoading;
  const displaySubscribed = internalSubscriptionState === undefined ? false : internalSubscriptionState;
  const subscriptionStateKnown = internalSubscriptionState !== undefined;

  return (
    <div className="mb-6 md:mb-8 animate-fade-in">
      {/* Main row: avatar + info + actions */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Small avatar */}
        <Avatar className="w-14 h-14 md:w-[72px] md:h-[72px] flex-shrink-0 ring-2 ring-[#E5E5E5]">
          <AvatarImage
            src={channel.thumbnail_url}
            alt={channel.title}
            className="object-cover"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
          <AvatarFallback className="bg-[#F5F5F5]">
            <img src={fallbackLogo} alt="YidVid" className="w-7 h-7 md:w-9 md:h-9" />
          </AvatarFallback>
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-[#F5F5F5] rounded-full flex items-center justify-center">
              <img src={fallbackLogo} alt="Loading" className="w-7 h-7 md:w-9 md:h-9 animate-pulse" />
            </div>
          )}
        </Avatar>

        {/* Channel info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg md:text-xl font-bold text-[#1A1A1A] truncate dark:!text-[#e8e8e8]">
            {channel.title}
          </h1>
          <p className="text-xs md:text-sm text-[#666666] dark:!text-[#aaaaaa]">
            {videoCount !== undefined ? `${videoCount} video${videoCount !== 1 ? 's' : ''}` : ''}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant={displaySubscribed && subscriptionStateKnown ? "default" : "outline"}
            onClick={handleSubscribeClick}
            disabled={buttonLoading}
            className={`h-9 md:h-10 text-xs md:text-sm px-4 md:px-5 rounded-full font-semibold transition-all duration-200 ${
              displaySubscribed && subscriptionStateKnown
                ? "bg-[#FF0000] hover:brightness-90 text-white border-0"
                : "border-2 border-[#1A1A1A] dark:border-[#e8e8e8] text-[#1A1A1A] dark:!text-[#e8e8e8] hover:bg-[#1A1A1A] hover:text-white dark:hover:bg-[#e8e8e8] dark:hover:!text-[#1A1A1A]"
            }`}
            aria-label={displaySubscribed && subscriptionStateKnown ? "Unsubscribe" : "Subscribe"}
          >
            {buttonLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : displaySubscribed && subscriptionStateKnown ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1.5" />
                Subscribed
              </>
            ) : (
              "Subscribe"
            )}
          </Button>

          <button
            onClick={handleShare}
            className="h-9 md:h-10 px-3 md:px-4 rounded-full bg-[#F5F5F5] dark:bg-[#272727] hover:bg-[#E5E5E5] dark:hover:bg-[#333] text-[#1A1A1A] dark:!text-[#e8e8e8] transition-colors flex items-center gap-1.5 text-xs md:text-sm font-medium"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
        </div>
      </div>

      {/* Description - collapsible on mobile */}
      {channel.description && (
        <div className="mt-3 md:mt-4 pl-[68px] md:pl-[88px]">
          {isMobile ? (
            <div>
              <p className={`text-[#666666] dark:!text-[#aaaaaa] text-xs leading-relaxed ${!descriptionExpanded ? 'line-clamp-2' : ''}`}>
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
            <p className="text-[#666666] dark:!text-[#aaaaaa] text-sm leading-relaxed max-w-3xl">
              {channel.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
