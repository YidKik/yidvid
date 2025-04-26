
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
    isAuthenticated,
    isSessionLoading
  } = useSubscriptionState(channelId);

  const { checkSubscriptionStatus } = useSubscriptionCheck();

  // Add an immediate check when component mounts
  useEffect(() => {
    if (!channelId || !userId) {
      console.log("No channel ID or user ID available, setting isSubscribed to false");
      setIsSubscribed(false);
      setIsCheckingSubscription(false);
      return;
    }
    
    const checkSubscription = async () => {
      try {
        console.log(`Initial subscription check for user ${userId} on channel ${channelId}`);
        setIsCheckingSubscription(true);
        const isCurrentlySubscribed = await checkSubscriptionStatus(userId, channelId);
        console.log(`Initial subscription check completed: user ${userId} ${isCurrentlySubscribed ? 'is' : 'is not'} subscribed to ${channelId}`);
        setIsSubscribed(isCurrentlySubscribed);
      } catch (err) {
        console.error("Failed to check initial subscription status:", err);
      } finally {
        setIsCheckingSubscription(false);
      }
    };
    
    // Ensure this runs immediately when we have userId and channelId
    checkSubscription();
  }, [channelId, userId, checkSubscriptionStatus, setIsCheckingSubscription, setIsSubscribed]);

  // Set up realtime updates
  const onSubscriptionChange = useCallback(async () => {
    if (!userId || !channelId) return;
    const result = await checkSubscriptionStatus(userId, channelId);
    setIsSubscribed(result);
    return result;
  }, [userId, channelId, checkSubscriptionStatus, setIsSubscribed]);

  useRealtimeUpdates(userId, channelId, onSubscriptionChange);

  const { processSubscription } = useSubscriptionProcess(
    userId,
    channelId,
    setIsCheckingSubscription,
    setLastChecked,
    setIsSubscribed
  );

  // Function to toggle subscription status with improved session validation
  const handleSubscribe = async (): Promise<void> => {
    if (!channelId) {
      console.error("No channel ID provided");
      throw new Error("Channel ID is required");
    }

    if (!isAuthenticated) {
      toast.error("Please sign in to subscribe to channels", { id: "signin-required" });
      throw new Error("Authentication required");
    }

    // Check if session is still loading
    if (isSessionLoading) {
      toast.error("Please wait, still loading your session");
      throw new Error("Session loading");
    }

    // Check if session exists but no user ID (possible invalid session state)
    if (!userId) {
      // Try forcing a session refresh first before showing error
      try {
        console.log("Session exists but no user ID found, attempting to refresh session");
        const { supabase } = await import("@/integrations/supabase/client");
        const { data } = await supabase.auth.getSession();
        
        if (data.session?.user?.id) {
          console.log("Successfully refreshed session and got user ID:", data.session.user.id);
          // Process subscription with refreshed userId
          return processSubscription(data.session.user.id, channelId);
        } else {
          console.error("Session refresh failed to retrieve user ID");
          toast.error("Authentication issue. Please sign out and sign in again.");
          throw new Error("User ID is required");
        }
      } catch (err) {
        console.error("Failed to refresh session:", err);
        toast.error("Authentication error. Please sign out and sign in again.");
        throw new Error("User ID is required");
      }
    }
    
    console.log("Processing subscription with userId:", userId, "channelId:", channelId);
    return processSubscription(userId, channelId);
  };

  // Add a function to verify the subscription status directly
  const verifySubscriptionStatus = useCallback(async () => {
    if (!userId || !channelId) return false;
    
    try {
      console.log(`Verifying subscription status for user ${userId} on channel ${channelId}`);
      setIsCheckingSubscription(true);
      const isCurrentlySubscribed = await checkSubscriptionStatus(userId, channelId);
      console.log(`Subscription verification: user ${userId} ${isCurrentlySubscribed ? 'is' : 'is not'} subscribed to ${channelId}`);
      setIsSubscribed(isCurrentlySubscribed);
      return isCurrentlySubscribed;
    } catch (err) {
      console.error("Failed to verify subscription status:", err);
      return false;
    } finally {
      setIsCheckingSubscription(false);
    }
  }, [userId, channelId, checkSubscriptionStatus, setIsCheckingSubscription, setIsSubscribed]);

  return { 
    isSubscribed, 
    handleSubscribe, 
    isLoading: isCheckingSubscription || isSessionLoading,
    checkSubscription: verifySubscriptionStatus
  };
};
