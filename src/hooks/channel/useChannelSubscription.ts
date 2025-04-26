
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

  // Check subscription status directly with Edge Function to avoid RLS issues
  const checkSubscriptionStatus = useCallback(async (uid: string, chId: string) => {
    if (!uid || !chId) return false;
    
    console.log(`Checking subscription status via edge function: user=${uid}, channel=${chId}`);
    
    try {
      const { data, error } = await supabase.functions.invoke('channel-subscribe', {
        body: {
          userId: uid,
          channelId: chId,
          action: 'check'
        }
      });
      
      if (error) {
        console.error('Error checking subscription status:', error);
        return false;
      }
      
      console.log(`Edge function subscription check result:`, data);
      return data?.isSubscribed || false;
    } catch (err) {
      console.error("Error in subscription check:", err);
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
        
        // Try using edge function to check subscription directly
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
          const isCurrentlySubscribed = await checkSubscriptionStatus(userId, channelId);
          console.log(`Real-time update triggered check: ${isCurrentlySubscribed ? 'Subscribed' : 'Not Subscribed'}`);
          setIsSubscribed(isCurrentlySubscribed);
        }
      )
      .subscribe();
      
    return () => {
      console.log("Cleaning up subscription listener");
      supabase.removeChannel(channel);
    };
  }, [channelId, userId, lastChecked, checkSubscriptionStatus]);

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

    if (!session?.user?.id) {
      console.error("User ID is missing");
      try {
        const refreshedSession = await refreshSession();
        if (!refreshedSession?.user?.id) {
          toast.error("Authentication error. Please try signing in again.", { id: "auth-error" });
          throw new Error("Failed to get user ID");
        }
        return processSubscription(refreshedSession.user.id, channelId);
      } catch (error) {
        console.error("Failed to refresh authentication:", error);
        toast.error("Authentication error. Please try signing in again.", { id: "auth-error" });
        throw error;
      }
    }
    
    return processSubscription(session.user.id, channelId);
  };

  // Process the actual subscription/unsubscription
  const processSubscription = async (currentUserId: string, currentChannelId: string): Promise<void> => {
    try {
      setIsCheckingSubscription(true);
      
      // Double-check the current subscription status before proceeding
      const currentStatus = await checkSubscriptionStatus(currentUserId, currentChannelId);
      console.log(`Verified subscription status before action: ${currentStatus ? 'Subscribed' : 'Not subscribed'}`);
      
      // The action should be the opposite of the current status
      const action = currentStatus ? 'unsubscribe' : 'subscribe';
      
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
        // Update local state based on the response from the server
        setIsSubscribed(data.isSubscribed);
        
        // Show appropriate toast message
        toast.success(data.isSubscribed ? "Subscribed to channel" : "Unsubscribed from channel");
        
        // Force a refresh of state
        setLastChecked(Date.now());
      } else {
        throw new Error(data.error || `Failed to ${action}`);
      }
    } catch (error: any) {
      console.error("Error managing subscription:", error);
      toast.error(`Subscription action failed: ${error.message}`);
      
      // Force a re-check to sync UI with database state
      setLastChecked(Date.now());
      throw error;
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
      const result = await checkSubscriptionStatus(userId, channelId);
      setIsSubscribed(result);
      return result;
    }
  };
};
