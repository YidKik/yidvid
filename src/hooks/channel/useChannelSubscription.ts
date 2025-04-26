
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSessionManager } from "@/hooks/useSessionManager";

export const useChannelSubscription = (channelId: string | undefined) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const [lastChecked, setLastChecked] = useState(Date.now());
  const { session, isAuthenticated, refreshSession } = useSessionManager();
  const userId = session?.user?.id;
  
  console.log("useChannelSubscription initialization:", { 
    channelId, 
    userId, 
    isAuthenticated, 
    hasSession: !!session,
    isSubscribed,
    lastChecked: new Date(lastChecked).toISOString()
  });

  // Direct database check function for subscriptions
  const checkSubscriptionInDatabase = useCallback(async (uid: string, chId: string) => {
    if (!uid || !chId) return false;
    
    console.log(`Performing direct DB check for subscription: user=${uid}, channel=${chId}`);
    
    try {
      // First try with a direct DB check
      const { data, error } = await supabase
        .from("channel_subscriptions")
        .select("id")
        .eq("channel_id", chId)
        .eq("user_id", uid)
        .maybeSingle();
      
      if (error) {
        console.error("Error in direct subscription check:", error);
        return false;
      }
      
      const exists = !!data;
      console.log(`Direct DB check result: ${exists ? 'Subscription found' : 'No subscription found'}`);
      return exists;
    } catch (err) {
      console.error("Unexpected error in subscription check:", err);
      return false;
    }
  }, []);

  // Effect to check subscription status whenever channelId or userId changes
  useEffect(() => {
    if (!channelId || !userId) {
      console.log("No channel ID or user ID available, setting isSubscribed to false");
      setIsSubscribed(false);
      return;
    }
    
    const checkSubscription = async () => {
      try {
        setIsCheckingSubscription(true);
        const isCurrentlySubscribed = await checkSubscriptionInDatabase(userId, channelId);
        
        console.log(`Subscription check completed: user ${userId} ${isCurrentlySubscribed ? 'is' : 'is not'} subscribed to ${channelId}`);
        setIsSubscribed(isCurrentlySubscribed);
      } catch (err) {
        console.error("Failed to check subscription status:", err);
      } finally {
        setIsCheckingSubscription(false);
      }
    };
    
    checkSubscription();
    
    // Set up a subscription to channel_subscriptions table for real-time updates
    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'channel_subscriptions',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          console.log("Real-time subscription update detected:", payload);
          
          // Re-check subscription status when subscription data changes
          const isCurrentlySubscribed = await checkSubscriptionInDatabase(userId, channelId);
          console.log(`Real-time update triggered check: ${isCurrentlySubscribed ? 'Subscribed' : 'Not Subscribed'}`);
          setIsSubscribed(isCurrentlySubscribed);
        }
      )
      .subscribe();
      
    return () => {
      console.log("Cleaning up subscription listener");
      supabase.removeChannel(channel);
    };
  }, [channelId, userId, lastChecked, checkSubscriptionInDatabase]);

  // Function to toggle subscription status
  const handleSubscribe = async () => {
    if (!channelId) {
      console.error("No channel ID provided");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please sign in to subscribe to channels", { id: "signin-required" });
      return;
    }

    if (!session?.user?.id) {
      console.error("User ID is missing");
      try {
        const refreshedSession = await refreshSession();
        if (!refreshedSession?.user?.id) {
          toast.error("Authentication error. Please try signing in again.", { id: "auth-error" });
          return;
        }
        return processSubscription(refreshedSession.user.id, channelId);
      } catch (error) {
        console.error("Failed to refresh authentication:", error);
        toast.error("Authentication error. Please try signing in again.", { id: "auth-error" });
        return;
      }
    }
    
    return processSubscription(session.user.id, channelId);
  };

  // Process the actual subscription/unsubscription
  const processSubscription = async (currentUserId: string, currentChannelId: string) => {
    setIsCheckingSubscription(true);
    
    // Double-check the current subscription status before proceeding
    const actualCurrentState = await checkSubscriptionInDatabase(currentUserId, currentChannelId);
    console.log(`Verified subscription status before action: ${actualCurrentState ? 'Subscribed' : 'Not subscribed'}`);
    
    // If the state doesn't match our current understanding, update our state first
    if (actualCurrentState !== isSubscribed) {
      console.log(`Correcting local subscription state from ${isSubscribed} to ${actualCurrentState}`);
      setIsSubscribed(actualCurrentState);
    }
    
    // The action should be the opposite of the actual current state
    const action = actualCurrentState ? 'unsubscribe' : 'subscribe';
    
    try {
      console.log(`Processing ${action} request for user ${currentUserId} on channel ${currentChannelId}`);
      
      // Use the edge function to manage subscription
      const { data, error } = await supabase.functions.invoke('channel-subscribe', {
        body: {
          channelId: currentChannelId,
          userId: currentUserId,
          action: action
        }
      });

      if (error) {
        console.error("Edge function error:", error);
        throw error;
      }
      
      console.log("Edge function response:", data);
      
      if (data.success) {
        // Verify the operation completed successfully
        const expectedNewState = action === 'subscribe';
        const verificationCheck = await checkSubscriptionInDatabase(currentUserId, currentChannelId);
        
        console.log(`Verification after ${action}: Expected ${expectedNewState ? 'subscribed' : 'not subscribed'}, 
          actual DB shows ${verificationCheck ? 'subscribed' : 'not subscribed'}`);
        
        // If the verification doesn't match what we expect after the action, something went wrong
        if (verificationCheck !== expectedNewState) {
          console.error(`Verification failed: DB shows ${verificationCheck ? 'subscribed' : 'not subscribed'} 
            but expected ${expectedNewState ? 'subscribed' : 'not subscribed'}`);
          
          throw new Error(`Database verification failed: subscription state is not as expected after ${action}`);
        }
        
        // Set state based on verified database state
        setIsSubscribed(verificationCheck);
        
        // Show appropriate toast message
        toast.success(verificationCheck ? "Subscribed to channel" : "Unsubscribed from channel");
        
        // Force a refresh of state
        setLastChecked(Date.now());
      } else {
        throw new Error(data.error || "Failed to update subscription");
      }
    } catch (error: any) {
      console.error("Error managing subscription:", error);
      toast.error(`Failed to ${action}: ${error.message}`);
      
      // Force a re-check to sync UI with database state
      setTimeout(async () => {
        const actualState = await checkSubscriptionInDatabase(currentUserId, currentChannelId);
        console.log(`After error recovery, subscription state is: ${actualState ? 'subscribed' : 'not subscribed'}`);
        setIsSubscribed(actualState);
      }, 1000);
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  return { 
    isSubscribed, 
    handleSubscribe, 
    isLoading: isCheckingSubscription,
    checkSubscription: async () => {
      if (!userId || !channelId) return false;
      const result = await checkSubscriptionInDatabase(userId, channelId);
      setIsSubscribed(result);
      return result;
    }
  };
};
