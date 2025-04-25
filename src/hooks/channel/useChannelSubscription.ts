
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export const useChannelSubscription = (channelId: string | null | undefined) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { session, isAuthenticated } = useAuth();

  // Check subscription status when component mounts or channelId changes
  useEffect(() => {
    const checkSubscription = async () => {
      // Don't check if no channelId or user is not authenticated
      if (!channelId || !isAuthenticated || !session?.user?.id) {
        setIsSubscribed(false);
        return;
      }

      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from("channel_subscriptions")
          .select("*")
          .eq("channel_id", channelId)
          .eq("user_id", session.user.id)
          .maybeSingle();
          
        if (error) {
          console.error("Error checking subscription:", error);
        }

        setIsSubscribed(!!data);
      } catch (err) {
        console.error("Failed to check subscription status:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [channelId, isAuthenticated, session]);

  const handleSubscribe = async () => {
    if (!channelId) {
      console.error("No channel ID provided");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please sign in to subscribe to channels", { id: "signin-required" });
      return;
    }
    
    // Get current session to ensure we have the latest user data
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    
    if (!currentSession?.user?.id) {
      toast.error("User session not found. Please try signing in again.", { id: "no-session" });
      return;
    }

    setIsLoading(true);

    try {
      // Use the edge function for reliable subscription management
      const response = await fetch(
        "https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/channel-subscribe",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${currentSession.access_token}`
          },
          body: JSON.stringify({
            channelId,
            userId: currentSession.user.id,
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

  return { isSubscribed, handleSubscribe, isLoading };
};
