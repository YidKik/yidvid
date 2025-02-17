
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useChannelSubscription = (channelId: string | undefined) => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (channelId) {
      checkSubscription();
    }
  }, [channelId]);

  const checkSubscription = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: subscription } = await supabase
      .from("channel_subscriptions")
      .select("*")
      .eq("channel_id", channelId)
      .eq("user_id", session.user.id)
      .maybeSingle();

    setIsSubscribed(!!subscription);
  };

  const handleSubscribe = async () => {
    if (!channelId) {
      console.error("No channel ID provided");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Please sign in to subscribe to channels");
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
        toast.success("Unsubscribed from channel");
      } else {
        const { error } = await supabase
          .from("channel_subscriptions")
          .insert({
            channel_id: channelId,
            user_id: session.user.id
          });

        if (error) throw error;
        setIsSubscribed(true);
        toast.success("Subscribed to channel");
      }
    } catch (error: any) {
      console.error("Error managing subscription:", error);
      toast.error("Failed to update subscription");
    }
  };

  return { isSubscribed, handleSubscribe };
};
