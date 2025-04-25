
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export const useChannelSubscription = (channelId: string | undefined) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const { session, isAuthenticated } = useAuth();

  // Use this effect to monitor auth state changes and recheck subscription
  useEffect(() => {
    if (!channelId || !isAuthenticated) return;
    
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
  }, [isAuthenticated]);

  // Use separate effect for initial check and channelId changes
  useEffect(() => {
    if (channelId && isAuthenticated) {
      checkSubscription();
    }
  }, [channelId, isAuthenticated]);

  const checkSubscription = async () => {
    if (!channelId || !isAuthenticated || isCheckingSubscription) return;
    
    try {
      setIsCheckingSubscription(true);
      
      if (!session?.user?.id) {
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

    if (!isAuthenticated) {
      toast.error("Please sign in to subscribe to channels", { id: "signin-required" });
      return;
    }

    if (!session?.user?.id) {
      toast.error("User session not found", { id: "no-session" });
      return;
    }

    try {
      // Use the edge function for reliable subscription management
      const response = await fetch(
        "https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/channel-subscribe",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg`
          },
          body: JSON.stringify({
            channelId,
            userId: session.user.id,
            action: isSubscribed ? 'unsubscribe' : 'subscribe'
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update subscription");
      }

      const result = await response.json();
      
      setIsSubscribed(result.isSubscribed);
      toast.success(
        isSubscribed ? "Unsubscribed from channel" : "Subscribed to channel", 
        { id: `subscription-${channelId}` }
      );
    } catch (error: any) {
      console.error("Error managing subscription:", error);
      toast.error(`Failed to update subscription: ${error.message}`, { id: "subscription-error" });
    }
  };

  return { isSubscribed, handleSubscribe };
};
