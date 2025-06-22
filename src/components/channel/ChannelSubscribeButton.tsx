
import { UserPlus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEnhancedChannelSubscription } from "@/hooks/channel/useEnhancedChannelSubscription";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { toast } from "sonner";

interface ChannelSubscribeButtonProps {
  channelId: string;
  channelName: string;
  className?: string;
}

export const ChannelSubscribeButton = ({ 
  channelId, 
  channelName, 
  className = "" 
}: ChannelSubscribeButtonProps) => {
  const { isAuthenticated, isLoading: authLoading, isProfileLoading } = useUnifiedAuth();
  
  const { 
    isSubscribed, 
    handleSubscribe, 
    isLoading: subscriptionLoading,
    isUserDataReady
  } = useEnhancedChannelSubscription(channelId);

  console.log("ChannelSubscribeButton state:", {
    channelId,
    channelName,
    isAuthenticated,
    isUserDataReady,
    isSubscribed,
    authLoading,
    isProfileLoading,
    subscriptionLoading
  });

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

  if (!isAuthenticated) {
    return (
      <Button
        variant="outline"
        onClick={() => toast.info("Please sign in to subscribe to channels")}
        className={`rounded-full px-6 py-2 text-sm transition-all duration-300 active:scale-95 font-medium bg-white border-gray-300 hover:bg-gray-50 hover:border-red-500 text-gray-700 hover:text-red-500 ${className}`}
      >
        <UserPlus className="w-4 h-4 mr-2" />
        <span>Subscribe</span>
      </Button>
    );
  }

  return (
    <Button
      variant={isSubscribed ? "default" : "outline"}
      onClick={handleSubscribeClick}
      disabled={isLoading}
      className={`rounded-full px-6 py-2 text-sm transition-all duration-300 active:scale-95 font-medium
        ${isSubscribed 
          ? "bg-red-500 border-red-500 hover:bg-red-600 text-white shadow-md" 
          : "bg-white border-gray-300 hover:bg-gray-50 hover:border-red-500 text-gray-700 hover:text-red-500"
        } ${className}`}
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
  );
};
