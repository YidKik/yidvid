
import { UserPlus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChannelSubscription } from "@/hooks/channel/useChannelSubscription";
import { useSessionManager } from "@/hooks/useSessionManager";
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
  const { session, isAuthenticated, isLoading: isSessionLoading } = useSessionManager();
  
  const { 
    isSubscribed, 
    handleSubscribe, 
    isLoading: isLoadingSubscription 
  } = useChannelSubscription(channelId);

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
      disabled={isLoadingSubscription || isSessionLoading}
      className={`rounded-full px-6 py-2 text-sm transition-all duration-300 active:scale-95 font-medium
        ${isSubscribed 
          ? "bg-red-500 border-red-500 hover:bg-red-600 text-white shadow-md" 
          : "bg-white border-gray-300 hover:bg-gray-50 hover:border-red-500 text-gray-700 hover:text-red-500"
        } ${className}`}
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
  );
};
