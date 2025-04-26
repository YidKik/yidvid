
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSessionManager } from "@/hooks/useSessionManager";

export const useChannelSubscription = (channelId: string | undefined) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const { session } = useSessionManager();
  const userId = session?.user?.id;

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
    if (!channelId || !userId || isCheckingSubscription) return;
    
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
      console.log("Subscription check result:", !!subscription, "for channel:", channelId);
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

    if (!userId) {
      toast.error("Please sign in to subscribe to channels", { id: "signin-required" });
      return;
    }

    try {
      if (isSubscribed) {
        // Unsubscribe
        const { error } = await supabase
          .from("channel_subscriptions")
          .delete()
          .eq("channel_id", channelId)
          .eq("user_id", userId);

        if (error) throw error;
        
        setIsSubscribed(false);
        toast.success("Unsubscribed from channel");
      } else {
        // Subscribe
        const { error } = await supabase
          .from("channel_subscriptions")
          .insert({
            channel_id: channelId,
            user_id: userId
          });

        if (error) throw error;
        
        setIsSubscribed(true);
        toast.success("Subscribed to channel");
      }
      
      // Refetch subscription status to ensure UI is in sync
      checkSubscription();
    } catch (error: any) {
      console.error("Error managing subscription:", error);
      toast.error(`Failed to update subscription: ${error.message}`);
    }
  };

  return { isSubscribed, handleSubscribe, isLoading: isCheckingSubscription };
};
