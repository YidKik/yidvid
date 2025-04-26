
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSessionManager } from "@/hooks/useSessionManager";

export const useChannelSubscription = (channelId: string | undefined) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const { session, isAuthenticated } = useSessionManager();
  const userId = session?.user?.id;
  
  console.log("useChannelSubscription hook state:", { 
    channelId, 
    userId, 
    isAuthenticated, 
    hasSession: !!session 
  });

  // Effect to check subscription status whenever channelId or userId changes
  useEffect(() => {
    if (!channelId || !userId) {
      setIsSubscribed(false);
      return;
    }
    
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
        () => {
          // Re-check subscription status when subscription data changes
          checkSubscription();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, userId]);

  const checkSubscription = async () => {
    if (!channelId || !userId) return;
    
    try {
      setIsCheckingSubscription(true);
      
      const { data: subscription, error } = await supabase
        .from("channel_subscriptions")
        .select("id")
        .eq("channel_id", channelId)
        .eq("user_id", userId)
        .maybeSingle();
      
      if (error) {
        console.error("Error checking subscription:", error);
      }

      // Update subscription status based on whether data exists
      setIsSubscribed(!!subscription);
      console.log("Subscription check result:", !!subscription, "for channel:", channelId, "user:", userId);
    } catch (err) {
      console.error("Failed to check subscription status:", err);
    } finally {
      setIsCheckingSubscription(false);
    }
  };

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
      // Instead of showing an error toast, try to refresh the auth state
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session?.user?.id) {
          toast.error("Authentication error. Please try signing in again.", { id: "auth-error" });
          return;
        }
        // If we got a valid session, continue with that user ID
        const refreshedUserId = data.session.user.id;
        await processSubscription(refreshedUserId);
      } catch (error) {
        console.error("Failed to refresh authentication:", error);
        toast.error("Authentication error. Please try signing in again.", { id: "auth-error" });
      }
    } else {
      // If we already have user ID, proceed normally
      await processSubscription(session.user.id);
    }
  };

  const processSubscription = async (currentUserId: string) => {
    setIsCheckingSubscription(true);
    
    try {
      console.log(`Processing ${isSubscribed ? 'unsubscribe' : 'subscribe'} request for user ${currentUserId} on channel ${channelId}`);
      
      // Use the edge function to manage subscription
      const { data, error } = await supabase.functions.invoke('channel-subscribe', {
        body: {
          channelId,
          userId: currentUserId,
          action: isSubscribed ? 'unsubscribe' : 'subscribe'
        }
      });

      if (error) {
        console.error("Edge function error:", error);
        throw error;
      }
      
      console.log("Subscription edge function response:", data);
      
      if (data.success) {
        // Important: Update local state based on what the server returned
        setIsSubscribed(data.isSubscribed);
        toast.success(data.isSubscribed ? "Subscribed to channel" : "Unsubscribed from channel");
        
        // After edge function call, verify subscription status directly from database
        const { data: verificationData, error: verificationError } = await supabase
          .from("channel_subscriptions")
          .select("id")
          .eq("channel_id", channelId)
          .eq("user_id", currentUserId)
          .maybeSingle();
          
        if (verificationError) {
          console.error("Error verifying subscription:", verificationError);
        } else {
          const dbSubscriptionExists = !!verificationData;
          console.log("Database verification:", dbSubscriptionExists ? "Subscription exists" : "No subscription found");
          
          // Only update state if it doesn't match what's in the database
          if (dbSubscriptionExists !== isSubscribed) {
            console.log(`Correcting local state to match database: ${dbSubscriptionExists}`);
            setIsSubscribed(dbSubscriptionExists);
          }
        }
      } else {
        throw new Error(data.error || "Failed to update subscription");
      }
    } catch (error: any) {
      console.error("Error managing subscription:", error);
      toast.error(`Failed to update subscription: ${error.message}`);
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  return { isSubscribed, handleSubscribe, isLoading: isCheckingSubscription };
};
