
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useRealtimeUpdates = (
  userId: string | undefined,
  channelId: string | undefined,
  onSubscriptionChange: () => Promise<void>
) => {
  useEffect(() => {
    if (!channelId || !userId) return;

    console.log(`Setting up realtime subscription listener for user ${userId} on channel ${channelId}`);

    // First, enable realtime for the channel_subscriptions table if not already
    const enableRealtimeForTable = async () => {
      try {
        await supabase.rpc('supabase_realtime.enable_subscription', {
          table: 'channel_subscriptions'
        });
        console.log("Realtime enabled for channel_subscriptions table");
      } catch (err) {
        console.log("Note: Realtime may already be enabled or not available");
      }
    };
    
    enableRealtimeForTable();

    const channel = supabase
      .channel(`subscription-changes-${userId}-${channelId}`) // Make channel name unique per user/channel combo
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'channel_subscriptions',
          filter: `user_id=eq.${userId}` 
        },
        async (payload) => {
          console.log("Real-time subscription update detected:", payload);
          
          // For INSERT/DELETE events specific to this channel, react immediately
          if (
            (payload.eventType === 'INSERT' && payload.new?.channel_id === channelId) || 
            (payload.eventType === 'DELETE' && payload.old?.channel_id === channelId)
          ) {
            console.log(`Direct subscription change for channel ${channelId}`);
            await onSubscriptionChange();
          } else {
            // For other events, verify subscription status
            console.log("Indirect subscription change, rechecking status");
            await onSubscriptionChange();
          }
        }
      )
      .subscribe((status) => {
        console.log(`Realtime subscription status for user ${userId}: ${status}`);
      });
      
    return () => {
      console.log(`Cleaning up subscription listener for user ${userId} on channel ${channelId}`);
      supabase.removeChannel(channel);
    };
  }, [channelId, userId, onSubscriptionChange]);
};
