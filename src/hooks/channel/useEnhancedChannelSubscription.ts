
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { toast } from "sonner";

export const useEnhancedChannelSubscription = (channelId: string | undefined) => {
  const { isAuthenticated, user, profile, isLoading: authLoading, isProfileLoading } = useUnifiedAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  const userId = user?.id;
  const isUserDataReady = isAuthenticated && userId && profile && !authLoading && !isProfileLoading;

  console.log("useEnhancedChannelSubscription state:", {
    channelId,
    userId,
    isAuthenticated,
    hasProfile: !!profile,
    isUserDataReady,
    authLoading,
    isProfileLoading,
    isSubscribed
  });

  // Check subscription status
  const checkSubscriptionStatus = useCallback(async () => {
    if (!isUserDataReady || !channelId) {
      console.log("Cannot check subscription - user data not ready or no channel ID");
      return false;
    }

    console.log(`Checking subscription status for user ${userId} on channel ${channelId}`);
    
    try {
      const { data, error } = await supabase
        .from("channel_subscriptions")
        .select("id")
        .eq("user_id", userId)
        .eq("channel_id", channelId)
        .maybeSingle();

      if (error) {
        console.error("Error checking subscription:", error);
        setSubscriptionError(error.message);
        return false;
      }

      const subscribed = !!data;
      console.log(`User ${userId} ${subscribed ? 'is' : 'is not'} subscribed to channel ${channelId}`);
      return subscribed;
    } catch (err: any) {
      console.error("Unexpected error checking subscription:", err);
      setSubscriptionError(err.message);
      return false;
    }
  }, [isUserDataReady, channelId, userId]);

  // Initial subscription check
  useEffect(() => {
    if (!channelId) {
      setIsCheckingSubscription(false);
      return;
    }

    if (!isAuthenticated) {
      setIsSubscribed(false);
      setIsCheckingSubscription(false);
      return;
    }

    if (isUserDataReady) {
      setIsCheckingSubscription(true);
      checkSubscriptionStatus()
        .then(subscribed => {
          setIsSubscribed(subscribed);
          setSubscriptionError(null);
        })
        .catch(err => {
          console.error("Failed to check subscription:", err);
          setSubscriptionError(err.message);
        })
        .finally(() => {
          setIsCheckingSubscription(false);
        });
    }
  }, [channelId, isUserDataReady, checkSubscriptionStatus, isAuthenticated]);

  // Handle subscription toggle
  const handleSubscribe = useCallback(async () => {
    if (!channelId) {
      toast.error("Channel ID is required");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please sign in to subscribe to channels");
      return;
    }

    if (!isUserDataReady) {
      toast.info("Please wait while we load your profile...");
      return;
    }

    setIsCheckingSubscription(true);
    setSubscriptionError(null);

    try {
      console.log(`Toggling subscription for user ${userId} on channel ${channelId}`);
      
      const { error } = await supabase.functions.invoke('channel-subscribe', {
        body: {
          channelId: channelId,
          userId: userId,
          action: isSubscribed ? 'unsubscribe' : 'subscribe'
        }
      });

      if (error) {
        console.error("Subscription toggle error:", error);
        throw error;
      }

      // Update local state
      setIsSubscribed(!isSubscribed);
      
      const action = isSubscribed ? 'unsubscribed from' : 'subscribed to';
      toast.success(`Successfully ${action} this channel!`);
      
    } catch (error: any) {
      console.error("Failed to toggle subscription:", error);
      const errorMessage = error.message || "Failed to update subscription";
      setSubscriptionError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCheckingSubscription(false);
    }
  }, [channelId, isAuthenticated, isUserDataReady, userId, isSubscribed]);

  return {
    isSubscribed,
    isLoading: isCheckingSubscription || (!isAuthenticated ? false : !isUserDataReady),
    handleSubscribe,
    error: subscriptionError,
    isUserDataReady
  };
};
