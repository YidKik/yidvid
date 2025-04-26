
import { useState, useEffect } from "react";
import { useSessionManager } from "@/hooks/useSessionManager";

export const useSubscriptionState = (channelId: string | undefined) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);
  const [lastChecked, setLastChecked] = useState(Date.now());
  const { session, isAuthenticated, isLoading: isSessionLoading } = useSessionManager();
  const userId = session?.user?.id;

  // Wait for session to stabilize before showing subscription status
  const isInitialLoading = isSessionLoading || (isAuthenticated && !userId);

  // Log detailed authentication state for debugging
  useEffect(() => {
    // Don't attempt subscription checks until we have session info
    if (isInitialLoading) {
      setIsCheckingSubscription(true);
    }
    
    console.log("useSubscriptionState auth state:", { 
      channelId, 
      userId, 
      isAuthenticated,
      isSessionLoading,
      hasSession: !!session,
      isSubscribed,
      isInitialLoading,
      lastChecked: new Date(lastChecked).toISOString()
    });
  }, [channelId, userId, isAuthenticated, isSessionLoading, session, isSubscribed, lastChecked, isInitialLoading]);

  return {
    isSubscribed,
    setIsSubscribed,
    isCheckingSubscription,
    setIsCheckingSubscription,
    lastChecked,
    setLastChecked,
    userId,
    isAuthenticated,
    isSessionLoading,
    isInitialLoading
  };
};
