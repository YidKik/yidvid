
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useChannelSubscription = (channelId: string | undefined) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);

  // Use this effect to monitor auth state changes and recheck subscription
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        checkSubscription();
      } else if (event === 'SIGNED_OUT') {
        setIsSubscribed(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Use separate effect for initial check and channelId changes
  useEffect(() => {
    if (channelId) {
      checkSubscription();
    }
  }, [channelId]);

  const checkSubscription = async () => {
    if (!channelId || isCheckingSubscription) return;
    
    try {
      setIsCheckingSubscription(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsSubscribed(false);
        return;
      }

      const { data: subscription, error } = await supabase
        .from("channel_subscriptions")
        .select("*")
        .eq("channel_id", channelId)
        .eq("user_id", session.user.id)
        .maybeSingle();
        
      if (error && !error.message.includes("policy")) {
        console.error("Error checking subscription:", error);
      }

      setIsSubscribed(!!subscription);
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

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Please sign in to subscribe to channels", { id: "signin-required" });
      return;
    }

    try {
      if (isSubscribed) {
        const { error } = await supabase
          .from("channel_subscriptions")
          .delete()
          .eq("channel_id", channelId)
          .eq("user_id", session.user.id);

        if (error) throw error;
        setIsSubscribed(false);
        toast.success("Unsubscribed from channel", { id: `unsubscribe-${channelId}` });
      } else {
        const { error } = await supabase
          .from("channel_subscriptions")
          .insert({
            channel_id: channelId,
            user_id: session.user.id
          });

        if (error) throw error;
        setIsSubscribed(true);
        toast.success("Subscribed to channel", { id: `subscribe-${channelId}` });
      }
    } catch (error: any) {
      console.error("Error managing subscription:", error);
      toast.error("Failed to update subscription", { id: "subscription-error" });
    }
  };

  return { isSubscribed, handleSubscribe };
};
