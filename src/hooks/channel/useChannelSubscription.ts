
import { useState, useEffect, useCallback } from "react";
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
        console.log("Skipping subscription check:", { 
          channelId, 
          isAuthenticated, 
          hasUser: !!session?.user?.id 
        });
        setIsSubscribed(false);
        return;
      }

      console.log("Checking subscription status for channel:", channelId);
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

        const isSubbed = !!data;
        console.log("Subscription check result:", { isSubbed, data });
        setIsSubscribed(isSubbed);
      } catch (err) {
        console.error("Failed to check subscription status:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [channelId, isAuthenticated, session?.user?.id]);

  const handleSubscribe = useCallback(async () => {
    if (!channelId) {
      console.error("No channel ID provided");
      toast.error("Channel information is missing", { id: "no-channel-id" });
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

    console.log(`Attempting to ${isSubscribed ? 'unsubscribe from' : 'subscribe to'} channel:`, channelId);
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
      console.log("Subscription update result:", result);
      
      setIsSubscribed(result.isSubscribed);
      
      // Show success message 
      toast.success(
        result.isSubscribed ? "Subscribed to channel" : "Unsubscribed from channel", 
        { id: `subscription-${channelId}` }
      );
    } catch (error: any) {
      console.error("Error managing subscription:", error);
      toast.error(`Failed to update subscription: ${error.message}`, { id: "subscription-error" });
    } finally {
      setIsLoading(false);
    }
  }, [channelId, isAuthenticated, isSubscribed]);

  return { isSubscribed, handleSubscribe, isLoading };
};
