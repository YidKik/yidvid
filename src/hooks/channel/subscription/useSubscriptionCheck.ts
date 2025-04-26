
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSubscriptionCheck = () => {
  const checkSubscriptionStatus = useCallback(async (uid: string, chId: string) => {
    if (!uid || !chId) return false;
    
    console.log(`Checking subscription status via edge function: user=${uid}, channel=${chId}`);
    
    try {
      const { data, error } = await supabase.functions.invoke('channel-subscribe', {
        body: {
          userId: uid,
          channelId: chId,
          action: 'check'
        }
      });
      
      if (error) {
        console.error('Error checking subscription status:', error);
        return false;
      }
      
      console.log(`Edge function subscription check result:`, data);
      return data?.isSubscribed || false;
    } catch (err) {
      console.error("Error in subscription check:", err);
      return false;
    }
  }, []);

  return { checkSubscriptionStatus };
};
