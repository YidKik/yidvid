
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSubscriptionCheck } from "./useSubscriptionCheck";

export const useSubscriptionProcess = (
  userId: string | undefined,
  channelId: string | undefined,
  setIsCheckingSubscription: (value: boolean) => void,
  setLastChecked: (value: number) => void,
  setIsSubscribed: (value: boolean) => void
) => {
  const { checkSubscriptionStatus } = useSubscriptionCheck();

  const processSubscription = useCallback(async (currentUserId: string, currentChannelId: string): Promise<void> => {
    try {
      setIsCheckingSubscription(true);
      
      // Double-check the current subscription status before proceeding
      const currentStatus = await checkSubscriptionStatus(currentUserId, currentChannelId);
      console.log(`Verified subscription status before action: ${currentStatus ? 'Subscribed' : 'Not subscribed'}`);
      
      // The action should be the opposite of the current status
      const action = currentStatus ? 'unsubscribe' : 'subscribe';
      
      console.log(`Processing ${action} request for user ${currentUserId} on channel ${currentChannelId}`);
      
      // Use the edge function to manage subscription
      const { data, error } = await supabase.functions.invoke('channel-subscribe', {
        body: {
          channelId: currentChannelId,
          userId: currentUserId,
          action: action
        }
      });

      if (error) {
        console.error("Edge function error:", error);
        throw error;
      }
      
      console.log("Edge function response:", data);
      
      if (data.success) {
        // Update local state based on the response from the server
        setIsSubscribed(data.isSubscribed);
        
        // Show appropriate toast message
        toast.success(data.isSubscribed ? "Subscribed to channel" : "Unsubscribed from channel");
        
        // Force a refresh of state
        setLastChecked(Date.now());
      } else {
        throw new Error(data.error || `Failed to ${action}`);
      }
    } catch (error: any) {
      console.error("Error managing subscription:", error);
      toast.error(`Subscription action failed: ${error.message}`);
      
      // Force a re-check to sync UI with database state
      setLastChecked(Date.now());
      throw error;
    } finally {
      setIsCheckingSubscription(false);
    }
  }, [checkSubscriptionStatus, setIsCheckingSubscription, setLastChecked, setIsSubscribed]);

  return { processSubscription };
};
