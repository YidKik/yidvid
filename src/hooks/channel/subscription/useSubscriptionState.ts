
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSessionManager } from "@/hooks/useSessionManager";

export const useSubscriptionState = (channelId: string | undefined) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);
  const [lastChecked, setLastChecked] = useState(Date.now());
  const { session, isAuthenticated } = useSessionManager();
  const userId = session?.user?.id;

  console.log("useSubscriptionState initialization:", { 
    channelId, 
    userId, 
    isAuthenticated,
    hasSession: !!session,
    isSubscribed,
    lastChecked: new Date(lastChecked).toISOString()
  });

  return {
    isSubscribed,
    setIsSubscribed,
    isCheckingSubscription,
    setIsCheckingSubscription,
    lastChecked,
    setLastChecked,
    userId,
    isAuthenticated
  };
};
