
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
        await processSubscription(refreshedSession.user.id, channelId);
      } catch (error) {
        console.error("Failed to refresh authentication:", error);
        toast.error("Authentication error. Please try signing in again.", { id: "auth-error" });
      }
    } else {
      await processSubscription(session.user.id, channelId);
    }
  };

  // Process the actual subscription/unsubscription
  const processSubscription = async (currentUserId: string, currentChannelId: string) => {
    setIsCheckingSubscription(true);
    const action = isSubscribed ? 'unsubscribe' : 'subscribe';
    
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
        // Manually verify the operation before updating the UI
        const verificationCheck = await checkSubscriptionInDatabase(currentUserId, currentChannelId);
        
        console.log(`Manual verification after ${action}: DB shows ${verificationCheck ? 'subscribed' : 'not subscribed'}`);
        
        // Set state based on ACTUAL database state, not what the API returned
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
      if (!userId || !channelId) return;
      const result = await checkSubscriptionInDatabase(userId, channelId);
      setIsSubscribed(result);
      return result;
    }
  };
};
