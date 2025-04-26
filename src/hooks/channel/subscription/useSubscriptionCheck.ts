
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSubscriptionCheck = () => {
  const checkSubscriptionStatus = useCallback(async (uid: string, chId: string) => {
    if (!uid || !chId) {
      console.log("Cannot check subscription: missing user ID or channel ID");
      return false;
    }
    
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
        
        // Retry with auth session to see if we have permission issues
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          console.error("No active session during subscription check");
          return false;
        }
        
        // Try again with fresh session
        const { data: retryCheck, error: retryError } = await supabase
          .from("channel_subscriptions")
          .select("id")
          .eq("user_id", uid)
          .eq("channel_id", chId)
          .maybeSingle();
          
        if (retryError) {
          console.error('Retry DB check also failed:', retryError);
          return false; // Return false explicitly on error
        } else if (retryCheck) {
          console.log(`Retry successful: User is subscribed`);
          return true;
        } else {
          console.log(`Retry successful: User is not subscribed`);
          return false;
        }
      } else {
        console.log(`Direct DB check result: ${directCheck ? 'Subscribed' : 'Not subscribed'}`);
        return !!directCheck;
      }
    } catch (err) {
      console.error("Error in subscription check:", err);
      return false;
    }
  }, []);

  return { checkSubscriptionStatus };
};
