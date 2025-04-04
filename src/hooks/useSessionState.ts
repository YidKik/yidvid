
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to track session state and provide auth state change notifications
 */
export const useSessionState = () => {
  const [sessionState, setSessionState] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data } = supabase.auth.onAuthStateChange((event) => {
      setSessionState(event);
      
      // Log the auth state change for debugging
      console.log(`Auth state changed: ${event}`);
    });
    
    // Fetch initial session
    const getInitialSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSessionState(data.session ? 'INITIAL_SESSION' : 'NO_SESSION');
    };
    
    getInitialSession();
    
    // Clean up subscription
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  return { sessionState };
};
