
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSubscriptionCheck = () => {
  const checkSubscriptionStatus = useCallback(async (uid: string, chId: string) => {
    if (!uid || !chId) return false;
    
    console.log(`Checking subscription status: user=${uid}, channel=${chId}`);
    
    try {
      // Try direct DB query first (most reliable)
      const { data: directCheck, error: directError } = await supabase
        .from("channel_subscriptions")
        .select("id")
        .eq("user_id", uid)
        .eq("channel_id", chId)
        .maybeSingle();
      
      if (directError) {
        console.error('Direct DB check error:', directError);
      } else {
        console.log(`Direct DB check result: ${directCheck ? 'Subscribed' : 'Not subscribed'}`);
        return !!directCheck;
      }
      
      // Fallback to edge function if direct check failed
      const { data, error } = await supabase.functions.invoke('channel-subscribe', {
        body: {
          userId: uid,
          channelId: chId,
          action: 'check'
        }
      });
      
      if (error) {
        console.error('Error checking subscription status via edge function:', error);
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
