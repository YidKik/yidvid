
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export const useChannelSubscription = (channelId: string | undefined) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
  }, [isAuthenticated, channelId]);

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
      
      const { data: currentSession } = await supabase.auth.getSession();
      
      if (!currentSession?.session?.user?.id) {
        setIsSubscribed(false);
        return;
      }

      const { data: subscription, error } = await supabase
        .from("channel_subscriptions")
        .select("*")
        .eq("channel_id", channelId)
        .eq("user_id", currentSession.session.user.id)
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

    try {
      setIsLoading(true);
      
      const { data: currentSession } = await supabase.auth.getSession();
      
      if (!currentSession?.session?.user?.id) {
        toast.error("User session not found. Please try signing in again.", { id: "no-session" });
        return;
      }

      // Use the edge function for reliable subscription management
      const response = await fetch(
        "https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/channel-subscribe",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${currentSession.session.access_token}`
          },
          body: JSON.stringify({
            channelId,
            userId: currentSession.session.user.id,
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
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    isSubscribed, 
    handleSubscribe, 
    isLoading: isCheckingSubscription || isLoading 
  };
};

