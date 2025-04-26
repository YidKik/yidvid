
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useSubscriptionState } from "./subscription/useSubscriptionState";
import { useSubscriptionCheck } from "./subscription/useSubscriptionCheck";
import { useRealtimeUpdates } from "./subscription/useRealtimeUpdates";
import { useSubscriptionProcess } from "./subscription/useSubscriptionProcess";

export const useChannelSubscription = (channelId: string | undefined) => {
  const {
    isSubscribed,
    setIsSubscribed,
    isCheckingSubscription,
    setIsCheckingSubscription,
    lastChecked,
    setLastChecked,
    userId,
    isAuthenticated
  } = useSubscriptionState(channelId);

  const { checkSubscriptionStatus } = useSubscriptionCheck();

  // Effect to check subscription status whenever channelId or userId changes
  useEffect(() => {
    if (!channelId || !userId) {
      console.log("No channel ID or user ID available, setting isSubscribed to false");
      setIsSubscribed(false);
      setIsCheckingSubscription(false);
      return;
    }
    
    const checkSubscription = async () => {
      try {
        setIsCheckingSubscription(true);
        const isCurrentlySubscribed = await checkSubscriptionStatus(userId, channelId);
        console.log(`Subscription check completed: user ${userId} ${isCurrentlySubscribed ? 'is' : 'is not'} subscribed to ${channelId}`);
        setIsSubscribed(isCurrentlySubscribed);
      } catch (err) {
        console.error("Failed to check subscription status:", err);
      } finally {
        setIsCheckingSubscription(false);
      }
    };
    
    checkSubscription();
  }, [channelId, userId, checkSubscriptionStatus]);

  // Set up realtime updates
  const onSubscriptionChange = useCallback(async () => {
    if (!userId || !channelId) return;
    const result = await checkSubscriptionStatus(userId, channelId);
    setIsSubscribed(result);
    return result;
  }, [userId, channelId, checkSubscriptionStatus]);

  useRealtimeUpdates(userId, channelId, onSubscriptionChange);

  const { processSubscription } = useSubscriptionProcess(
    userId,
    channelId,
    setIsCheckingSubscription,
    setLastChecked,
    setIsSubscribed
  );

  // Function to toggle subscription status
  const handleSubscribe = async (): Promise<void> => {
    if (!channelId) {
      console.error("No channel ID provided");
      throw new Error("Channel ID is required");
    }

    if (!isAuthenticated) {
      toast.error("Please sign in to subscribe to channels", { id: "signin-required" });
      throw new Error("Authentication required");
    }

    if (!userId) {
      console.error("User ID is missing");
      throw new Error("User ID is required");
    }
    
    return processSubscription(userId, channelId);
  };

  return { 
    isSubscribed, 
    handleSubscribe, 
    isLoading: isCheckingSubscription,
    checkSubscription: async () => {
      if (!userId || !channelId) return false;
      const result = await checkSubscriptionStatus(userId, channelId);
      setIsSubscribed(result);
      return result;
    }
  };
};
