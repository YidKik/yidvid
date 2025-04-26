
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSessionManager = () => {
  const { session, isAuthenticated, handleLogout, isLoggingOut } = useAuth();
  const [lastRefreshed, setLastRefreshed] = useState(Date.now());
  
  // Set up periodic session refresh 
  useEffect(() => {
    // Refresh session every 5 minutes to ensure token is valid
    const refreshInterval = setInterval(async () => {
      if (session) {
        try {
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            console.error("Error refreshing session:", error);
          } else if (data?.session) {
            // Session is still valid, update last refreshed time
            setLastRefreshed(Date.now());
          }
        } catch (err) {
          console.error("Session refresh failed:", err);
        }
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(refreshInterval);
  }, [session]);

  // Add more debugging to track authentication state
  console.log("SessionManager state:", { 
    hasSession: !!session, 
    isAuthenticated, 
    userId: session?.user?.id,
    userEmail: session?.user?.email,
    lastRefreshed: new Date(lastRefreshed).toISOString()
  });

  return { 
    session, 
    isAuthenticated,
    handleLogout,
    isLoggingOut,
    refreshSession: async () => {
      const { data } = await supabase.auth.getSession();
      setLastRefreshed(Date.now());
      return data?.session;
    }
  };
};
