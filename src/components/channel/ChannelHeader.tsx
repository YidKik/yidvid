import { UserPlus, Check, Loader2, Share2, Info } from "lucide-react";
import { ShareDialog } from "@/components/shared/ShareDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useSessionManager } from "@/hooks/useSessionManager";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const fallbackLogo = "/yidvid-logo-icon.png";
  const [internalSubscriptionState, setInternalSubscriptionState] = useState<boolean | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

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

  const shareUrl = window.location.href;

  const buttonLoading = isLoading || isProcessing || isSessionLoading;
  const displaySubscribed = internalSubscriptionState === undefined ? false : internalSubscriptionState;
  const subscriptionStateKnown = internalSubscriptionState !== undefined;

  return (
    <div className="mb-6 md:mb-8 animate-fade-in">
      <div className="flex flex-col items-center text-center gap-3">
        {/* Avatar */}
        <Avatar className="w-20 h-20 md:w-24 md:h-24 ring-2 ring-[#E5E5E5] dark:ring-[#333]">
          <AvatarImage
            src={channel.thumbnail_url}
            alt={channel.title}
            className="object-cover"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
          <AvatarFallback className="bg-[#F5F5F5] dark:bg-[#272727]">
            <img src={fallbackLogo} alt="YidVid" className="w-9 h-9 md:w-11 md:h-11" />
          </AvatarFallback>
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-[#F5F5F5] dark:bg-[#272727] rounded-full flex items-center justify-center">
              <img src={fallbackLogo} alt="Loading" className="w-9 h-9 animate-pulse" />
            </div>
          )}
        </Avatar>

        {/* Channel name */}
        <h1 className="text-xl md:text-2xl font-bold text-[#1A1A1A] dark:!text-[#e8e8e8]">
          {channel.title}
        </h1>

        {/* Video count */}
        <p className="text-xs md:text-sm text-[#666666] dark:!text-[#aaaaaa] -mt-1">
          {videoCount !== undefined ? `${videoCount} video${videoCount !== 1 ? 's' : ''}` : ''}
        </p>

        {/* Action buttons row */}
        <div className="flex items-center gap-2 mt-1">
          <Button
            variant={displaySubscribed && subscriptionStateKnown ? "default" : "outline"}
            onClick={handleSubscribeClick}
            disabled={buttonLoading}
            className={`h-9 text-xs md:text-sm px-5 rounded-full font-semibold transition-all duration-200 ${
              displaySubscribed && subscriptionStateKnown
                ? "bg-[#FF0000] hover:brightness-90 text-white border-0"
                : "border border-[#ccc] dark:border-[#555] text-[#1A1A1A] dark:!text-[#e8e8e8] hover:bg-[#F5F5F5] dark:hover:bg-[#333]"
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
            onClick={() => setShareOpen(true)}
            className="h-9 px-4 rounded-full bg-[#F5F5F5] dark:bg-[#272727] hover:bg-[#E5E5E5] dark:hover:bg-[#333] text-[#1A1A1A] dark:!text-[#e8e8e8] transition-colors flex items-center gap-1.5 text-xs md:text-sm font-medium"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
          <ShareDialog
            open={shareOpen}
            onOpenChange={setShareOpen}
            url={shareUrl}
            title={channel.title}
          />

          {channel.description && (
            <Dialog>
              <DialogTrigger asChild>
                <button className="h-9 px-4 rounded-full bg-[#F5F5F5] dark:bg-[#272727] hover:bg-[#E5E5E5] dark:hover:bg-[#333] text-[#1A1A1A] dark:!text-[#e8e8e8] transition-colors flex items-center gap-1.5 text-xs md:text-sm font-medium">
                  <Info className="w-3.5 h-3.5" />
                  Description
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg bg-white dark:bg-[#212121] border border-gray-200 dark:border-[#444] rounded-3xl shadow-xl [&>button]:opacity-100 [&>button]:text-black [&>button]:dark:text-white [&>button]:rounded-full [&>button]:w-8 [&>button]:h-8 [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:hover:bg-gray-100 [&>button]:dark:hover:bg-[#333] [&>button]:transition-colors">
                <DialogHeader>
                  <DialogTitle className="text-[#1A1A1A] dark:!text-[#e8e8e8]">About {channel.title}</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-[#666666] dark:!text-[#aaaaaa] leading-relaxed whitespace-pre-line">
                  {channel.description}
                </p>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
};
