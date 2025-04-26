
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useRealtimeUpdates = (
  userId: string | undefined,
  channelId: string | undefined,
  onSubscriptionChange: () => Promise<void>
) => {
  useEffect(() => {
    if (!channelId || !userId) return;

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
        async () => {
          console.log("Real-time subscription update detected");
          await onSubscriptionChange();
        }
      )
      .subscribe();
      
    return () => {
      console.log("Cleaning up subscription listener");
      supabase.removeChannel(channel);
    };
  }, [channelId, userId, onSubscriptionChange]);
};
